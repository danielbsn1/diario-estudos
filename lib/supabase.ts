import { createClient } from "@supabase/supabase-js";
import type { BlocoCronograma, Registro, SessaoPlanejada } from "@/lib/types";

type Database = {
  public: {
    Tables: {
      registros: {
        Row: Registro;
        Insert: Omit<Registro, "id" | "created_at" | "origem_tipo" | "origem_id" | "observacoes"> &
          Partial<Pick<Registro, "observacoes" | "origem_tipo" | "origem_id">>;
        Update: Partial<Registro>;
        Relationships: [];
      };
      cronograma_blocos: {
        Row: BlocoCronograma;
        Insert: Omit<BlocoCronograma, "id" | "ativo"> & Partial<Pick<BlocoCronograma, "ativo">>;
        Update: Partial<BlocoCronograma>;
        Relationships: [];
      };
      sessoes_planejadas: {
        Row: SessaoPlanejada;
        Insert: Omit<SessaoPlanejada, "id" | "concluida" | "registro_id"> &
          Partial<Pick<SessaoPlanejada, "concluida" | "registro_id">>;
        Update: Partial<SessaoPlanejada>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

let cliente: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (cliente) return cliente;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env.local (veja .env.example)."
    );
  }

  cliente = createClient<Database>(url, key, { auth: { persistSession: false } });
  return cliente;
}
