"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { CATEGORIAS, type Categoria } from "@/lib/types";

function revalidarTudo() {
  revalidatePath("/");
  revalidatePath("/agenda");
  revalidatePath("/historico");
}

function paraCategoria(valor: FormDataEntryValue | null): Categoria {
  return CATEGORIAS.includes(valor as Categoria) ? (valor as Categoria) : "Estudo";
}

function paraNumero(valor: FormDataEntryValue | null): number {
  return Number(String(valor ?? "").replace(",", "."));
}

// --- Registros (histórico) ---

export async function criarRegistro(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const categoria = paraCategoria(formData.get("categoria"));
  const horas = paraNumero(formData.get("horas"));
  const data = String(formData.get("data") ?? "");
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  if (!titulo || !data || !(horas > 0)) return;

  const { error } = await getSupabase().from("registros").insert({
    titulo,
    categoria,
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
  const categoria = paraCategoria(formData.get("categoria"));
  const diaSemana = Number(formData.get("dia_semana"));
  const horaInicio = String(formData.get("hora_inicio") ?? "");
  const duracaoHoras = paraNumero(formData.get("duracao_horas"));

  if (!titulo || !horaInicio || Number.isNaN(diaSemana) || !(duracaoHoras > 0)) return;

  const { error } = await getSupabase().from("cronograma_blocos").insert({
    titulo,
    categoria,
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

// --- Sessões planejadas (compromissos pontuais) ---

export async function criarSessaoPlanejada(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const categoria = paraCategoria(formData.get("categoria"));
  const data = String(formData.get("data") ?? "");
  const horaInicio = String(formData.get("hora_inicio") ?? "").trim();
  const duracaoHoras = paraNumero(formData.get("duracao_horas"));

  if (!titulo || !data || !(duracaoHoras > 0)) return;

  const { error } = await getSupabase().from("sessoes_planejadas").insert({
    titulo,
    categoria,
    data,
    hora_inicio: horaInicio || null,
    duracao_horas: duracaoHoras,
  });
  if (error) throw error;

  revalidarTudo();
}

export async function removerSessaoPlanejada(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await getSupabase().from("sessoes_planejadas").delete().eq("id", id);
  if (error) throw error;

  revalidarTudo();
}

// --- Marcar itens da agenda como concluídos (gera um registro no histórico) ---

export async function concluirBloco(formData: FormData) {
  const blocoId = String(formData.get("bloco_id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const categoria = paraCategoria(formData.get("categoria"));
  const data = String(formData.get("data") ?? "");
  const duracaoHoras = paraNumero(formData.get("duracao_horas"));

  if (!blocoId || !titulo || !data || !(duracaoHoras > 0)) return;

  const { error } = await getSupabase().from("registros").insert({
    titulo,
    categoria,
    horas: duracaoHoras,
    data,
    origem_tipo: "cronograma",
    origem_id: blocoId,
  });
  if (error) throw error;

  revalidarTudo();
}

export async function concluirSessao(formData: FormData) {
  const sessaoId = String(formData.get("sessao_id") ?? "");
  if (!sessaoId) return;

  const supabase = getSupabase();
  const { data: sessao, error: erroBusca } = await supabase
    .from("sessoes_planejadas")
    .select("*")
    .eq("id", sessaoId)
    .single();
  if (erroBusca) throw erroBusca;
  if (!sessao) return;

  const { data: novoRegistro, error: erroInsert } = await supabase
    .from("registros")
    .insert({
      titulo: sessao.titulo,
      categoria: sessao.categoria,
      horas: sessao.duracao_horas,
      data: sessao.data,
      origem_tipo: "sessao",
      origem_id: sessaoId,
    })
    .select("id")
    .single();
  if (erroInsert) throw erroInsert;

  const { error: erroUpdate } = await supabase
    .from("sessoes_planejadas")
    .update({ concluida: true, registro_id: novoRegistro.id })
    .eq("id", sessaoId);
  if (erroUpdate) throw erroUpdate;

  revalidarTudo();
}
