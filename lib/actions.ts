"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { CORES_MATERIA } from "@/lib/types";

function revalidarTudo() {
  revalidatePath("/");
  revalidatePath("/agenda");
  revalidatePath("/historico");
  revalidatePath("/materias");
}

function paraNumero(valor: FormDataEntryValue | null): number {
  return Number(String(valor ?? "").replace(",", "."));
}

// Lê os campos "duracao" + "unidade" (horas|minutos) de um formulário e
// devolve sempre em horas, que é como o banco armazena.
function paraHorasDeDuracao(formData: FormData): number {
  const valor = Number(String(formData.get("duracao") ?? "").replace(",", "."));
  if (!(valor > 0)) return 0;
  const unidade = String(formData.get("unidade") ?? "horas");
  return unidade === "minutos" ? valor / 60 : valor;
}

// --- Matérias ---

export async function criarMateria(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return;

  const supabase = getSupabase();
  const { count, error: erroContagem } = await supabase
    .from("materias")
    .select("id", { count: "exact", head: true });
  if (erroContagem) throw erroContagem;

  const cor = CORES_MATERIA[(count ?? 0) % CORES_MATERIA.length];

  const { error } = await supabase.from("materias").insert({ nome, cor });
  if (error) throw error;

  revalidarTudo();
}

export async function removerMateria(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await getSupabase().from("materias").delete().eq("id", id);
  if (error) throw error;

  revalidarTudo();
}

// --- Registros (histórico) ---

export async function criarRegistro(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const materiaId = String(formData.get("materia_id") ?? "").trim();
  const horas = paraHorasDeDuracao(formData);
  const data = String(formData.get("data") ?? "");
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  if (!titulo || !data || !(horas > 0)) return;

  const { error } = await getSupabase().from("registros").insert({
    titulo,
    materia_id: materiaId || null,
    horas,
    data,
    observacoes: observacoes || null,
  });
  if (error) throw error;

  revalidarTudo();
}

export async function removerRegistro(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await getSupabase().from("registros").delete().eq("id", id);
  if (error) throw error;

  revalidarTudo();
}

// --- Cronograma (horários fixos recorrentes) ---

export async function criarBlocoCronograma(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const materiaId = String(formData.get("materia_id") ?? "").trim();
  const diaSemana = Number(formData.get("dia_semana"));
  const horaInicio = String(formData.get("hora_inicio") ?? "");
  const duracaoHoras = paraHorasDeDuracao(formData);

  if (!titulo || !materiaId || !horaInicio || Number.isNaN(diaSemana) || !(duracaoHoras > 0)) return;

  const { error } = await getSupabase().from("cronograma_blocos").insert({
    titulo,
    materia_id: materiaId,
    dia_semana: diaSemana,
    hora_inicio: horaInicio,
    duracao_horas: duracaoHoras,
  });
  if (error) throw error;

  revalidarTudo();
}

export async function desativarBlocoCronograma(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await getSupabase()
    .from("cronograma_blocos")
    .update({ ativo: false })
    .eq("id", id);
  if (error) throw error;

  revalidarTudo();
}

// --- Marcar itens da agenda como concluídos (gera um registro no histórico) ---

export async function concluirBloco(formData: FormData) {
  const blocoId = String(formData.get("bloco_id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const materiaId = String(formData.get("materia_id") ?? "").trim();
  const data = String(formData.get("data") ?? "");
  const duracaoHoras = paraNumero(formData.get("duracao_horas"));

  if (!blocoId || !titulo || !data || !(duracaoHoras > 0)) return;

  const { error } = await getSupabase().from("registros").insert({
    titulo,
    materia_id: materiaId || null,
    horas: duracaoHoras,
    data,
    origem_tipo: "cronograma",
    origem_id: blocoId,
  });
  if (error) throw error;

  revalidarTudo();
}
