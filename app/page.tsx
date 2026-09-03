"use client";

import { useEffect, useMemo, useState } from "react";

type Categoria = "Estudo" | "Trabalho" | "Pessoal" | "Outro";

type Registro = {
  id: string;
  titulo: string;
  categoria: Categoria;
  horas: number;
  data: string; // yyyy-mm-dd
  observacoes: string;
};

const STORAGE_KEY = "diario-estudos:registros";
const CATEGORIAS: Categoria[] = ["Estudo", "Trabalho", "Pessoal", "Outro"];

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarHoras(horas: number) {
  return horas % 1 === 0 ? `${horas}h` : `${horas.toFixed(1)}h`;
}

export default function Home() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [carregado, setCarregado] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("Estudo");
  const [horas, setHoras] = useState("");
  const [data, setData] = useState(hoje());
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const salvo = window.localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      try {
        setRegistros(JSON.parse(salvo));
      } catch {
        setRegistros([]);
      }
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
    }
  }, [registros, carregado]);

  function adicionarRegistro(e: React.FormEvent) {
    e.preventDefault();
    const horasNumero = Number(horas.replace(",", "."));
    if (!titulo.trim() || !horasNumero || horasNumero <= 0) return;

    const novo: Registro = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      categoria,
      horas: horasNumero,
      data,
      observacoes: observacoes.trim(),
    };

    setRegistros((atual) =>
      [...atual, novo].sort((a, b) => b.data.localeCompare(a.data))
    );
    setTitulo("");
    setHoras("");
    setObservacoes("");
  }

  function removerRegistro(id: string) {
    setRegistros((atual) => atual.filter((r) => r.id !== id));
  }

  const grupos = useMemo(() => {
    const mapa = new Map<string, Registro[]>();
    for (const r of registros) {
      const lista = mapa.get(r.data) ?? [];
      lista.push(r);
      mapa.set(r.data, lista);
    }
    return Array.from(mapa.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [registros]);

  const totalGeral = registros.reduce((soma, r) => soma + r.horas, 0);

  return (
    <div className="min-h-full flex-1 bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:py-16">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Diário de Estudos
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Anote o que você fez no dia e quantas horas dedicou.
          </p>
        </header>

        <form
          onSubmit={adicionarRegistro}
          className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="titulo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              O que você fez
            </label>
            <input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Aula de Engenharia de Software"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoria" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Categoria
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="horas" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Horas
              </label>
              <input
                id="horas"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                placeholder="Ex: 2 ou 1.5"
                inputMode="decimal"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="data" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Data
            </label>
            <input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="observacoes" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Observações (opcional)
            </label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Detalhes, links, o que aprendeu..."
              className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <button
            type="submit"
            className="mt-1 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Adicionar registro
          </button>
        </form>

        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Histórico
            </h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Total: {formatarHoras(totalGeral)}
            </span>
          </div>

          {grupos.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum registro ainda. Adicione o primeiro acima.
            </p>
          )}

          {grupos.map(([diaData, itens]) => {
            const totalDia = itens.reduce((soma, r) => soma + r.horas, 0);
            return (
              <div key={diaData} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatarData(diaData)}
                  </h3>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatarHoras(totalDia)}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {itens.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-black dark:text-zinc-50">
                            {r.titulo}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {r.categoria}
                          </span>
                        </div>
                        {r.observacoes && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {r.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="whitespace-nowrap text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {formatarHoras(r.horas)}
                        </span>
                        <button
                          onClick={() => removerRegistro(r.id)}
                          aria-label="Remover registro"
                          className="text-xs text-zinc-400 transition-colors hover:text-red-500"
                        >
                          remover
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
