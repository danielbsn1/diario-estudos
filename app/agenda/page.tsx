import Link from "next/link";
import {
  concluirBloco,
  concluirSessao,
  criarBlocoCronograma,
  criarSessaoPlanejada,
  desativarBlocoCronograma,
  removerSessaoPlanejada,
} from "@/lib/actions";
import { listarCronograma, listarRegistrosEntre, listarSessoesEntre } from "@/lib/data";
import { CATEGORIAS } from "@/lib/types";
import {
  NOMES_DIA_SEMANA,
  NOMES_DIA_SEMANA_CURTO,
  formatarData,
  formatarHora,
  formatarHoras,
  inicioDaSemana,
  isoDeHoje,
  somarDias,
} from "@/lib/date";

export const dynamic = "force-dynamic";

const ORDEM_SELECT_DIA_SEMANA = [1, 2, 3, 4, 5, 6, 0];

type ItemAgenda = {
  chave: string;
  titulo: string;
  categoria: string;
  horaInicio: string | null;
  duracaoHoras: number;
  concluido: boolean;
} & (
  | { tipo: "cronograma"; blocoId: string }
  | { tipo: "sessao"; sessaoId: string }
);

export default async function AgendaPage(props: PageProps<"/agenda">) {
  const searchParams = await props.searchParams;
  const semanaParam = typeof searchParams.semana === "string" ? searchParams.semana : undefined;
  const segunda = inicioDaSemana(semanaParam ?? isoDeHoje());
  const domingo = somarDias(segunda, 6);
  const semanaAnterior = somarDias(segunda, -7);
  const proximaSemana = somarDias(segunda, 7);
  const semanaAtual = inicioDaSemana(isoDeHoje());

  const diasDaSemana = Array.from({ length: 7 }, (_, i) => somarDias(segunda, i));

  const [cronograma, sessoes, registros] = await Promise.all([
    listarCronograma(),
    listarSessoesEntre(segunda, domingo),
    listarRegistrosEntre(segunda, domingo),
  ]);

  const concluidosCronograma = new Set(
    registros
      .filter((r) => r.origem_tipo === "cronograma")
      .map((r) => `${r.origem_id}:${r.data}`)
  );

  const hoje = isoDeHoje();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Agenda
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Seu cronograma da semana: horários fixos e sessões pontuais.
        </p>
      </header>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href={`/agenda?semana=${semanaAnterior}`}
          className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Anterior
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-black dark:text-zinc-50">
            {formatarData(segunda)} – {formatarData(domingo)}
          </span>
          {segunda !== semanaAtual && (
            <Link
              href={`/agenda?semana=${semanaAtual}`}
              className="text-xs text-blue-600 underline dark:text-blue-400"
            >
              voltar para hoje
            </Link>
          )}
        </div>
        <Link
          href={`/agenda?semana=${proximaSemana}`}
          className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Próxima →
        </Link>
      </div>

      <section className="flex flex-col gap-6">
        {diasDaSemana.map((diaIso) => {
          const diaSemana = new Date(diaIso + "T00:00:00").getDay();

          const itensBloco: ItemAgenda[] = cronograma
            .filter((b) => b.dia_semana === diaSemana)
            .map((b) => ({
              chave: `bloco-${b.id}-${diaIso}`,
              tipo: "cronograma",
              blocoId: b.id,
              titulo: b.titulo,
              categoria: b.categoria,
              horaInicio: b.hora_inicio,
              duracaoHoras: b.duracao_horas,
              concluido: concluidosCronograma.has(`${b.id}:${diaIso}`),
            }));

          const itensSessao: ItemAgenda[] = sessoes
            .filter((s) => s.data === diaIso)
            .map((s) => ({
              chave: `sessao-${s.id}`,
              tipo: "sessao",
              sessaoId: s.id,
              titulo: s.titulo,
              categoria: s.categoria,
              horaInicio: s.hora_inicio,
              duracaoHoras: s.duracao_horas,
              concluido: s.concluida,
            }));

          const itens = [...itensBloco, ...itensSessao].sort((a, b) =>
            (a.horaInicio ?? "99:99").localeCompare(b.horaInicio ?? "99:99")
          );

          return (
            <div key={diaIso} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between border-b border-zinc-200 pb-1 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {NOMES_DIA_SEMANA[diaSemana]}
                </h3>
                <span
                  className={
                    "text-xs " +
                    (diaIso === hoje
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "text-zinc-500 dark:text-zinc-400")
                  }
                >
                  {formatarData(diaIso)}
                  {diaIso === hoje ? " · hoje" : ""}
                </span>
              </div>

              {itens.length === 0 && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Nada planejado.</p>
              )}

              <ul className="flex flex-col gap-2">
                {itens.map((item) => (
                  <li
                    key={item.chave}
                    className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        {item.horaInicio && (
                          <span className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                            {formatarHora(item.horaInicio)}
                          </span>
                        )}
                        <span className="text-sm font-medium text-black dark:text-zinc-50">
                          {item.titulo}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {item.categoria}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          {item.tipo === "cronograma" ? "fixo" : "pontual"}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatarHoras(item.duracaoHoras)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.concluido ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                          Concluído
                        </span>
                      ) : item.tipo === "cronograma" ? (
                        <form action={concluirBloco}>
                          <input type="hidden" name="bloco_id" value={item.blocoId} />
                          <input type="hidden" name="titulo" value={item.titulo} />
                          <input type="hidden" name="categoria" value={item.categoria} />
                          <input type="hidden" name="data" value={diaIso} />
                          <input type="hidden" name="duracao_horas" value={item.duracaoHoras} />
                          <button
                            type="submit"
                            className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                          >
                            Concluir
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2">
                          <form action={concluirSessao}>
                            <input type="hidden" name="sessao_id" value={item.sessaoId} />
                            <button
                              type="submit"
                              className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                              Concluir
                            </button>
                          </form>
                          <form action={removerSessaoPlanejada}>
                            <input type="hidden" name="id" value={item.sessaoId} />
                            <button
                              type="submit"
                              aria-label="Remover sessão"
                              className="text-xs text-zinc-400 hover:text-red-500"
                            >
                              remover
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <details className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="cursor-pointer text-sm font-semibold text-black dark:text-zinc-50">
          Horários fixos (repetem toda semana)
        </summary>

        <div className="mt-4 flex flex-col gap-4">
          {cronograma.length > 0 && (
            <ul className="flex flex-col gap-2">
              {cronograma.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {NOMES_DIA_SEMANA_CURTO[b.dia_semana]} {formatarHora(b.hora_inicio)} ·{" "}
                    <span className="font-medium text-black dark:text-zinc-50">{b.titulo}</span>{" "}
                    ({formatarHoras(b.duracao_horas)})
                  </span>
                  <form action={desativarBlocoCronograma}>
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      type="submit"
                      className="text-xs text-zinc-400 hover:text-red-500"
                    >
                      remover
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form action={criarBlocoCronograma} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bloco-titulo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Matéria / atividade
              </label>
              <input
                id="bloco-titulo"
                name="titulo"
                placeholder="Ex: Matemática"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="bloco-categoria" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Categoria
                </label>
                <select
                  id="bloco-categoria"
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
                <label htmlFor="bloco-dia" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Dia da semana
                </label>
                <select
                  id="bloco-dia"
                  name="dia_semana"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  {ORDEM_SELECT_DIA_SEMANA.map((dia) => (
                    <option key={dia} value={dia}>
                      {NOMES_DIA_SEMANA[dia]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="bloco-hora" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Horário
                </label>
                <input
                  id="bloco-hora"
                  name="hora_inicio"
                  type="time"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="bloco-duracao" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Duração (horas)
                </label>
                <input
                  id="bloco-duracao"
                  name="duracao_horas"
                  placeholder="Ex: 2"
                  inputMode="decimal"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Adicionar horário fixo
            </button>
          </form>
        </div>
      </details>

      <details className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="cursor-pointer text-sm font-semibold text-black dark:text-zinc-50">
          Nova sessão pontual (data específica)
        </summary>

        <form action={criarSessaoPlanejada} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sessao-titulo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Matéria / atividade
            </label>
            <input
              id="sessao-titulo"
              name="titulo"
              placeholder="Ex: Revisão para a prova"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sessao-categoria" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Categoria
              </label>
              <select
                id="sessao-categoria"
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
              <label htmlFor="sessao-data" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Data
              </label>
              <input
                id="sessao-data"
                name="data"
                type="date"
                defaultValue={hoje}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sessao-hora" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Horário (opcional)
              </label>
              <input
                id="sessao-hora"
                name="hora_inicio"
                type="time"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sessao-duracao" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Duração (horas)
              </label>
              <input
                id="sessao-duracao"
                name="duracao_horas"
                placeholder="Ex: 1.5"
                inputMode="decimal"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-1 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Agendar sessão
          </button>
        </form>
      </details>
    </main>
  );
}
