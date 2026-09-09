"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/agenda", label: "Agenda" },
  { href: "/materias", label: "Matérias" },
  { href: "/historico", label: "Histórico" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-1 px-4 py-3">
        <span className="mr-3 text-sm font-semibold text-black dark:text-zinc-50">
          Diário de Estudos
        </span>
        {LINKS.map((link) => {
          const ativo = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors " +
                (ativo
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/60")
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
