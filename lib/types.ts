export type Categoria = "Estudo" | "Trabalho" | "Pessoal" | "Outro";

export const CATEGORIAS: Categoria[] = ["Estudo", "Trabalho", "Pessoal", "Outro"];

export type Registro = {
  id: string;
  titulo: string;
  categoria: Categoria;
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
  categoria: Categoria;
  dia_semana: number; // 0 = domingo ... 6 = sábado (Date#getDay)
  hora_inicio: string; // HH:MM:SS
  duracao_horas: number;
  ativo: boolean;
};

export type SessaoPlanejada = {
  id: string;
  titulo: string;
  categoria: Categoria;
  data: string; // yyyy-mm-dd
  hora_inicio: string | null;
  duracao_horas: number;
  concluida: boolean;
  registro_id: string | null;
};
