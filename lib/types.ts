// As 8 cores categóricas do sistema de design (ver skill de dataviz), na
// ordem em que devem ser atribuídas a novas matérias (nunca por índice
// aleatório) para manter contraste entre matérias vizinhas.
export const CORES_MATERIA = [
  "#2a78d6", // azul
  "#eb6834", // laranja
  "#1baf7a", // água
  "#eda100", // amarelo
  "#e87ba4", // magenta
  "#008300", // verde
  "#4a3aa7", // violeta
  "#e34948", // vermelho
] as const;

export type Materia = {
  id: string;
  nome: string;
  cor: string;
};

export type Registro = {
  id: string;
  titulo: string;
  materia_id: string | null;
  horas: number;
  data: string; // yyyy-mm-dd
  observacoes: string | null;
  origem_tipo: "cronograma" | "sessao" | null;
  origem_id: string | null;
  created_at: string;
};

export type BlocoCronograma = {
  id: string;
  titulo: string;
  materia_id: string;
  dia_semana: number; // 0 = domingo ... 6 = sábado (Date#getDay)
  hora_inicio: string; // HH:MM:SS
  duracao_horas: number;
  ativo: boolean;
};
