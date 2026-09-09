import Link from "next/link";
import { estatisticasDashboard, relatorioSemanal } from "@/lib/data";
import {
  NOMES_DIA_SEMANA,
  NOMES_DIA_SEMANA_CURTO,
  formatarData,
  formatarHoras,
  inicioDaSemana,
  isoDeHoje,
  somarDias,
} from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function DashboardPage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const semanaParam = typeof searchParams.semana === "string" ? searchParams.semana : undefined;
  const segunda = inicioDaSemana(semanaParam ?? isoDeHoje());
  const semanaAtual = inicioDaSemana(isoDeHoje());
  const semanaAnterior = somarDias(segunda, -7);
  const proximaSemana = somarDias(segunda, 7);

  const [stats, relatorio] = await Promise.all([estatisticasDashboard(), relatorioSemanal(segunda)]);

  const maxTotalDia = Math.max(1, ...relatorio.dias.map((d) => d.total));
  const corPorMateria = new Map(relatorio.porMateria.map((m) => [m.materiaId, m.cor]));
  const hoje = isoDeHoje();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Visão geral do seu progresso nos estudos.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Essa semana" valor={formatarHoras(stats.horasSemana)} />
        <StatTile label="Este mês" valor={formatarHoras(stats.horasMes)} />
        <StatTile
          label="Sequência"
          valor={`${stats.sequenciaDias}d`}
          nota={stats.sequenciaDias > 0 ? "dias seguidos" : "comece hoje"}
        />
        <StatTile
          label="Pendentes hoje"
          valor={String(stats.pendentesHoje)}
          nota={stats.pendentesHoje > 0 ? undefined : "tudo em dia"}
        />
      </section>

      {stats.pendentesHoje > 0 && (
        <Link
          href="/agenda"
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
        >
          Você tem {stats.pendentesHoje}{" "}
          {stats.pendentesHoje === 1 ? "item pendente" : "itens pendentes"} na agenda de hoje →
        </Link>
      )}

      <figure className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <figcaption className="text-sm font-semibold text-black dark:text-zinc-50">
            Relatório semanal
          </figcaption>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href={`/?semana=${semanaAnterior}`}
              className="font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              ← Anterior
            </Link>
            <span className="text-zinc-500 dark:text-zinc-400">
              {formatarData(segunda)} – {formatarData(relatorio.domingo)}
            </span>
            <Link
              href={`/?semana=${proximaSemana}`}
              className="font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Próxima →
            </Link>
          </div>
        </div>
        {segunda !== semanaAtual && (
          <Link href="/" className="-mt-2 text-xs text-blue-600 underline dark:text-blue-400">
            voltar para esta semana
          </Link>
        )}

        <div className="flex h-32 items-end gap-2">
          {relatorio.dias.map((d) => (
            <div key={d.data} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                {d.total > 0 ? formatarHoras(d.total) : ""}
              </span>
              <div
                title={`${formatarData(d.data)}: ${formatarHoras(d.total)}`}
                className="flex w-full flex-col-reverse gap-0.5 overflow-hidden rounded-t"
                style={{ height: `${Math.max(3, (d.total / maxTotalDia) * 100)}%` }}
              >
                {d.total > 0 ? (
                  d.porMateria.map((seg) => (
                    <div
                      key={seg.materiaId}
                      className="w-full"
                      style={{
                        flexGrow: seg.horas,
                        backgroundColor: corPorMateria.get(seg.materiaId) ?? "var(--chart-muted)",
                      }}
                    />
                  ))
                ) : (
                  <div className="w-full flex-1" style={{ backgroundColor: "var(--chart-grid)" }} />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {relatorio.dias.map((d) => {
            const diaSemana = new Date(d.data + "T00:00:00").getDay();
            return (
              <span
                key={d.data}
                className={
                  "flex-1 text-center text-[10px] " +
                  (d.data === hoje
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400")
                }
              >
                {NOMES_DIA_SEMANA_CURTO[diaSemana]}
              </span>
            );
          })}
        </div>

        {relatorio.porMateria.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Nenhum registro nesta semana ainda.
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            {relatorio.porMateria.map((m) => (
              <div key={m.materiaId} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: m.cor }}
                  aria-hidden
                />
                <span className="text-zinc-700 dark:text-zinc-300">{m.nome}</span>
                <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatarHoras(m.horas)}
                </span>
              </div>
            ))}
          </div>
        )}

        <details className="text-xs text-zinc-500 dark:text-zinc-400">
          <summary className="cursor-pointer">Ver como tabela</summary>
          <table className="mt-2 w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-1 font-medium">Dia</th>
                <th className="py-1 font-medium">Horas</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.dias.map((d) => (
                <tr key={d.data}>
                  <td className="py-0.5">
                    {NOMES_DIA_SEMANA[new Date(d.data + "T00:00:00").getDay()]} ({formatarData(d.data)})
                  </td>
                  <td className="py-0.5 tabular-nums">{formatarHoras(d.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </figure>
    </main>
  );
}

function StatTile({ label, valor, nota }: { label: string; valor: string; nota?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-xl font-semibold tabular-nums text-black dark:text-zinc-50">
        {valor}
      </span>
      {nota && <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{nota}</span>}
    </div>
  );
}
