import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type Crumb = {
  label: string;
  /** Sem href = item atual (não clicável). */
  href?: string;
};

export default function Breadcrumb({
  items,
  tone = "light",
}: {
  items: Crumb[];
  /** "dark" para uso sobre fundos azuis (faixa de título do produto). */
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <nav aria-label="Trilha de navegação" className="text-sm">
      <ol
        className={`flex flex-wrap items-center gap-1.5 ${
          dark ? "text-brand-200" : "text-slate-500"
        }`}
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={
                    dark
                      ? "hover:text-white hover:underline"
                      : "hover:text-brand-500 hover:underline"
                  }
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={`font-medium ${
                    dark ? "text-white" : "text-brand-700"
                  }`}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-accent-300"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
