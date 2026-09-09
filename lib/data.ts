import { getSupabase } from "@/lib/supabase";
import type { BlocoCronograma, Materia, Registro } from "@/lib/types";
import { inicioDoMes, isoDeHoje, somarDias } from "@/lib/date";

export async function listarMaterias(): Promise<Materia[]> {
  const { data, error } = await getSupabase().from("materias").select("*").order("nome");
  if (error) throw error;
  return data as Materia[];
}

export async function listarRegistros(): Promise<Registro[]> {
  const { data, error } = await getSupabase()
    .from("registros")
    .select("*")
    .order("data", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Registro[];
}

export async function listarRegistrosEntre(inicio: string, fim: string): Promise<Registro[]> {
  const { data, error } = await getSupabase()
    .from("registros")
    .select("*")
    .gte("data", inicio)
    .lte("data", fim);
  if (error) throw error;
  return data as Registro[];
}

export async function totalHorasPorMateria(): Promise<Map<string, number>> {
  const { data, error } = await getSupabase().from("registros").select("materia_id, horas");
  if (error) throw error;

  const totais = new Map<string, number>();
  for (const r of data) {
    if (!r.materia_id) continue;
    totais.set(r.materia_id, (totais.get(r.materia_id) ?? 0) + r.horas);
  }
  return totais;
}

export async function listarCronograma(): Promise<BlocoCronograma[]> {
  const { data, error } = await getSupabase()
    .from("cronograma_blocos")
    .select("*")
    .eq("ativo", true)
    .order("dia_semana", { ascending: true })
    .order("hora_inicio", { ascending: true });
  if (error) throw error;
  return data as BlocoCronograma[];
}

export type EstatisticasDashboard = {
  horasSemana: number;
  horasMes: number;
  sequenciaDias: number;
  pendentesHoje: number;
};

export async function estatisticasDashboard(): Promise<EstatisticasDashboard> {
  const hoje = isoDeHoje();
  const inicioJanela = somarDias(hoje, -29); // janela ampla, só para calcular a sequência
  const inicioMes = inicioDoMes(hoje);
  const diaSemanaHoje = new Date().getDay();

  const [registrosJanela, cronogramaHoje] = await Promise.all([
    listarRegistrosEntre(inicioJanela, hoje),
    getSupabase().from("cronograma_blocos").select("id").eq("ativo", true).eq("dia_semana", diaSemanaHoje),
  ]);

  if (cronogramaHoje.error) throw cronogramaHoje.error;

  let horasSemana = 0;
  let horasMes = 0;
  const diasComRegistro = new Set<string>();

  const inicioSemanaIso = somarDias(hoje, -6);

  for (const r of registrosJanela) {
    diasComRegistro.add(r.data);
    if (r.data >= inicioSemanaIso) horasSemana += r.horas;
    if (r.data >= inicioMes) horasMes += r.horas;
  }

  let sequenciaDias = 0;
  let cursor = diasComRegistro.has(hoje) ? hoje : somarDias(hoje, -1);
  while (diasComRegistro.has(cursor)) {
    sequenciaDias++;
    cursor = somarDias(cursor, -1);
  }

  return {
    horasSemana,
    horasMes,
    sequenciaDias,
    pendentesHoje: cronogramaHoje.data?.length ?? 0,
  };
}

export type RelatorioSemanalDia = {
  data: string;
  total: number;
  porMateria: { materiaId: string; horas: number }[];
};

export type RelatorioSemanal = {
  segunda: string;
  domingo: string;
  dias: RelatorioSemanalDia[];
  porMateria: { materiaId: string; nome: string; cor: string; horas: number }[];
};

const SEM_MATERIA = "sem-materia";

export async function relatorioSemanal(segunda: string): Promise<RelatorioSemanal> {
  const domingo = somarDias(segunda, 6);
  const [registros, materias] = await Promise.all([
    listarRegistrosEntre(segunda, domingo),
    listarMaterias(),
  ]);

  const materiaPorId = new Map(materias.map((m) => [m.id, m]));

  const dias: RelatorioSemanalDia[] = Array.from({ length: 7 }, (_, i) => {
    const data = somarDias(segunda, i);
    const doDia = registros.filter((r) => r.data === data);
    const porMateriaMapa = new Map<string, number>();
    for (const r of doDia) {
      const chave = r.materia_id ?? SEM_MATERIA;
      porMateriaMapa.set(chave, (porMateriaMapa.get(chave) ?? 0) + r.horas);
    }
    return {
      data,
      total: doDia.reduce((soma, r) => soma + r.horas, 0),
      porMateria: Array.from(porMateriaMapa.entries()).map(([materiaId, horas]) => ({ materiaId, horas })),
    };
  });

  const totalPorMateriaMapa = new Map<string, number>();
  for (const r of registros) {
    const chave = r.materia_id ?? SEM_MATERIA;
    totalPorMateriaMapa.set(chave, (totalPorMateriaMapa.get(chave) ?? 0) + r.horas);
  }

  return {
    segunda,
    domingo,
    dias,
    porMateria: Array.from(totalPorMateriaMapa.entries())
      .map(([materiaId, horas]) => ({
        materiaId,
        nome: materiaId === SEM_MATERIA ? "Sem matéria" : materiaPorId.get(materiaId)?.nome ?? "Matéria removida",
        cor: materiaId === SEM_MATERIA ? "var(--chart-muted)" : materiaPorId.get(materiaId)?.cor ?? "var(--chart-muted)",
        horas,
      }))
      .sort((a, b) => b.horas - a.horas),
  };
}
