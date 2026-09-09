export const NOMES_DIA_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export const NOMES_DIA_SEMANA_CURTO = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
] as const;

// Ordem de exibição da semana: segunda a domingo.
export const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0];

export function isoDeHoje(): string {
  return isoDeData(new Date());
}

export function isoDeData(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function dataDeIso(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

export function somarDias(iso: string, dias: number): string {
  const d = dataDeIso(iso);
  d.setDate(d.getDate() + dias);
  return isoDeData(d);
}

export function inicioDaSemana(iso: string): string {
  const d = dataDeIso(iso);
  const diaSemana = d.getDay(); // 0 = domingo
  const deslocamento = diaSemana === 0 ? -6 : 1 - diaSemana;
  return somarDias(iso, deslocamento);
}

export function diaDaSemanaDe(iso: string): number {
  return dataDeIso(iso).getDay();
}

export function inicioDoMes(iso: string): string {
  const d = dataDeIso(iso);
  return isoDeData(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataCurta(iso: string): string {
  const d = dataDeIso(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatarHoras(horas: number): string {
  const totalMinutos = Math.round(horas * 60);
  const h = Math.floor(totalMinutos / 60);
  const m = totalMinutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatarHora(hhmmss: string): string {
  return hhmmss.slice(0, 5);
}
