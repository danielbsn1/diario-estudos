import { criarRegistro, removerRegistro } from "@/lib/actions";
import { listarRegistros } from "@/lib/data";
import { CATEGORIAS } from "@/lib/types";
import { formatarData, formatarHoras, isoDeHoje } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const registros = await listarRegistros();

  const grupos = new Map<string, typeof registros>();
  for (const r of registros) {
    const lista = grupos.get(r.data) ?? [];
    lista.push(r);
    grupos.set(r.data, lista);
  }

  const totalGeral = registros.reduce((soma, r) => soma + r.horas, 0);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Histórico
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Anote o que você fez no dia e quantas horas dedicou.
        </p>
      </header>

      <form
        action={criarRegistro}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="titulo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            O que você fez
          </label>
          <input
            id="titulo"
            name="titulo"
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
              name="categoria"
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
              name="horas"
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
            name="data"
            type="date"
            defaultValue={isoDeHoje()}
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
            name="observacoes"
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
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Registros</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Total: {formatarHoras(totalGeral)}
          </span>
        </div>

        {grupos.size === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum registro ainda. Adicione o primeiro acima, ou marque um item da{" "}
            <a href="/agenda" className="underline">
              agenda
            </a>{" "}
            como concluído.
          </p>
        )}

        {Array.from(grupos.entries()).map(([diaData, itens]) => {
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
                        {r.origem_tipo && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            via agenda
                          </span>
                        )}
                      </div>
                      {r.observacoes && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.observacoes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="whitespace-nowrap text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {formatarHoras(r.horas)}
                      </span>
                      <form action={removerRegistro}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          aria-label="Remover registro"
                          className="text-xs text-zinc-400 transition-colors hover:text-red-500"
                        >
                          remover
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </main>
  );
}
