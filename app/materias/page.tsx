import { criarMateria, removerMateria } from "@/lib/actions";
import { listarMaterias, totalHorasPorMateria } from "@/lib/data";
import { formatarHoras } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function MateriasPage() {
  const [materias, totais] = await Promise.all([listarMaterias(), totalHorasPorMateria()]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Matérias
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          As disciplinas ou assuntos que você estuda. Crie aqui antes de montar seu
          cronograma na agenda ou registrar horas no histórico.
        </p>
      </header>

      <form
        action={criarMateria}
        className="flex items-end gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="nome" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nome da matéria
          </label>
          <input
            id="nome"
            name="nome"
            placeholder="Ex: Matemática, Direito Penal, Inglês..."
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            required
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Adicionar
        </button>
      </form>

      <section className="flex flex-col gap-2">
        {materias.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma matéria ainda. Adicione a primeira acima.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {materias.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: m.cor }}
                  aria-hidden
                />
                <span className="text-sm font-medium text-black dark:text-zinc-50">{m.nome}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatarHoras(totais.get(m.id) ?? 0)} no total
                </span>
                <form action={removerMateria}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    aria-label={`Remover ${m.nome}`}
                    className="text-xs text-zinc-400 hover:text-red-500"
                  >
                    remover
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
