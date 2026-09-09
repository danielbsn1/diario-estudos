import { createClient } from "@supabase/supabase-js";
import type { BlocoCronograma, Materia, Registro } from "@/lib/types";

type Database = {
  public: {
    Tables: {
      materias: {
        Row: Materia;
        Insert: Omit<Materia, "id">;
        Update: Partial<Materia>;
        Relationships: [];
      };
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
