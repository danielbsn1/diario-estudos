import Link from "next/link";
import { estatisticasDashboard } from "@/lib/data";
import { CATEGORIAS } from "@/lib/types";
import { NOMES_DIA_SEMANA_CURTO, formatarData, formatarDataCurta, formatarHoras } from "@/lib/date";

export const dynamic = "force-dynamic";

const COR_CATEGORIA: Record<string, string> = {
  [CATEGORIAS[0]]: "var(--chart-cat-1)",
  [CATEGORIAS[1]]: "var(--chart-cat-2)",
  [CATEGORIAS[2]]: "var(--chart-cat-3)",
  [CATEGORIAS[3]]: "var(--chart-cat-4)",
};

export default async function DashboardPage() {
  const stats = await estatisticasDashboard();

  const maxDia = Math.max(1, ...stats.porDia.map((d) => d.horas));
  const maxCategoria = Math.max(1, ...stats.porCategoria.map((c) => c.horas));
  const diaComMaisHoras = stats.porDia.reduce(
    (melhor, atual) => (atual.horas > melhor.horas ? atual : melhor),
    stats.porDia[0]
  );

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
        <figcaption className="text-sm font-semibold text-black dark:text-zinc-50">
          Horas nos últimos 14 dias
        </figcaption>

        <div className="flex h-28 items-end gap-1.5 border-b" style={{ borderColor: "var(--chart-baseline)" }}>
          {stats.porDia.map((d) => {
            const altura = Math.max(2, (d.horas / maxDia) * 100);
            const ehDestaque = d.data === diaComMaisHoras?.data && d.horas > 0;
            return (
              <div key={d.data} className="flex flex-1 flex-col items-center justify-end gap-1">
                {ehDestaque && (
                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    {formatarHoras(d.horas)}
                  </span>
                )}
                <div
                  title={`${formatarData(d.data)}: ${formatarHoras(d.horas)}`}
                  className="w-full rounded-t"
                  style={{
                    height: `${altura}%`,
                    backgroundColor: "var(--chart-sequential)",
                    opacity: d.horas === 0 ? 0.15 : 1,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5">
          {stats.porDia.map((d) => (
            <span
              key={d.data}
              className="flex-1 text-center text-[10px] text-zinc-500 dark:text-zinc-400"
            >
              {NOMES_DIA_SEMANA_CURTO[new Date(d.data + "T00:00:00").getDay()][0]}
            </span>
          ))}
        </div>

        <details className="text-xs text-zinc-500 dark:text-zinc-400">
          <summary className="cursor-pointer">Ver como tabela</summary>
          <table className="mt-2 w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-1 font-medium">Data</th>
                <th className="py-1 font-medium">Horas</th>
              </tr>
            </thead>
            <tbody>
              {stats.porDia.map((d) => (
                <tr key={d.data}>
                  <td className="py-0.5">{formatarDataCurta(d.data)}</td>
                  <td className="py-0.5 tabular-nums">{formatarHoras(d.horas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </figure>

      <figure className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <figcaption className="text-sm font-semibold text-black dark:text-zinc-50">
          Horas por categoria (este mês)
        </figcaption>

        {stats.porCategoria.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Nenhum registro este mês ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.porCategoria.map((c) => (
              <div key={c.categoria} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {c.categoria}
                  </span>
                  <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatarHoras(c.horas)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full" style={{ backgroundColor: "var(--chart-grid)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.max(4, (c.horas / maxCategoria) * 100)}%`,
                      backgroundColor: COR_CATEGORIA[c.categoria],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <details className="text-xs text-zinc-500 dark:text-zinc-400">
          <summary className="cursor-pointer">Ver como tabela</summary>
          <table className="mt-2 w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-1 font-medium">Categoria</th>
                <th className="py-1 font-medium">Horas</th>
              </tr>
            </thead>
            <tbody>
              {stats.porCategoria.map((c) => (
                <tr key={c.categoria}>
                  <td className="py-0.5">{c.categoria}</td>
                  <td className="py-0.5 tabular-nums">{formatarHoras(c.horas)}</td>
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
