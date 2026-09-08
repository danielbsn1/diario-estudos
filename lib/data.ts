import { getSupabase } from "@/lib/supabase";
import type { BlocoCronograma, Categoria, Registro, SessaoPlanejada } from "@/lib/types";
import { CATEGORIAS } from "@/lib/types";
import { inicioDoMes, isoDeHoje, somarDias } from "@/lib/date";

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

export async function listarSessoesEntre(inicio: string, fim: string): Promise<SessaoPlanejada[]> {
  const { data, error } = await getSupabase()
    .from("sessoes_planejadas")
    .select("*")
    .gte("data", inicio)
    .lte("data", fim)
    .order("hora_inicio", { ascending: true });
  if (error) throw error;
  return data as SessaoPlanejada[];
}

export type EstatisticasDashboard = {
  horasSemana: number;
  horasMes: number;
  sequenciaDias: number;
  pendentesHoje: number;
  porDia: { data: string; horas: number }[];
  porCategoria: { categoria: Categoria; horas: number }[];
};

export async function estatisticasDashboard(): Promise<EstatisticasDashboard> {
  const hoje = isoDeHoje();
  const inicioJanela = somarDias(hoje, -13); // últimos 14 dias
  const inicioMes = inicioDoMes(hoje);
  const diaSemanaHoje = new Date().getDay();

  const [registros14, cronogramaHoje, sessoesHoje] = await Promise.all([
    listarRegistrosEntre(inicioJanela, hoje),
    getSupabase().from("cronograma_blocos").select("id").eq("ativo", true).eq("dia_semana", diaSemanaHoje),
    getSupabase().from("sessoes_planejadas").select("id").eq("data", hoje).eq("concluida", false),
  ]);

  if (cronogramaHoje.error) throw cronogramaHoje.error;
  if (sessoesHoje.error) throw sessoesHoje.error;

  const porDiaMapa = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    porDiaMapa.set(somarDias(inicioJanela, i), 0);
  }

  let horasSemana = 0;
  let horasMes = 0;
  const porCategoriaMapa = new Map<Categoria, number>();
  const diasComRegistro = new Set<string>();

  const inicioSemanaIso = somarDias(hoje, -6);

  for (const r of registros14) {
    porDiaMapa.set(r.data, (porDiaMapa.get(r.data) ?? 0) + r.horas);
    diasComRegistro.add(r.data);
    if (r.data >= inicioSemanaIso) horasSemana += r.horas;
    if (r.data >= inicioMes) horasMes += r.horas;
    if (CATEGORIAS.includes(r.categoria)) {
      porCategoriaMapa.set(r.categoria, (porCategoriaMapa.get(r.categoria) ?? 0) + r.horas);
    }
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
    pendentesHoje: (cronogramaHoje.data?.length ?? 0) + (sessoesHoje.data?.length ?? 0),
    porDia: Array.from(porDiaMapa.entries()).map(([data, horas]) => ({ data, horas })),
    porCategoria: CATEGORIAS.filter((c) => porCategoriaMapa.has(c)).map((categoria) => ({
      categoria,
      horas: porCategoriaMapa.get(categoria)!,
    })),
  };
}
