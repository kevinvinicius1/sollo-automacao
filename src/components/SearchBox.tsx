"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildSearchIndex, searchProducts } from "@/lib/search";

/** Item leve para a busca client-side (evita embutir o catálogo inteiro). */
export type SearchItem = {
  code: string;
  name: string;
  slug: string;
  shortDescription: string;
};

const MAX_RESULTS = 8;

export default function SearchBox({
  items,
  onNavigate,
}: {
  items: SearchItem[];
  /** Chamado ao navegar para um resultado (ex.: fechar menu mobile). */
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(() => buildSearchIndex(items), [items]);

  const allResults = useMemo(
    () => searchProducts(fuse, query),
    [fuse, query]
  );
  const results = allResults.slice(0, MAX_RESULTS);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function reset() {
    setOpen(false);
    setQuery("");
    setActive(-1);
    onNavigate?.();
  }

  function go(slug: string) {
    reset();
    router.push(`/produto/${slug}/`);
  }

  /** Enter sem item selecionado abre a página de resultados. */
  function goToSearchPage() {
    const q = query.trim();
    if (q.length < 2) return;
    reset();
    router.push(`/busca/?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const target = active >= 0 ? results[active] : undefined;
      if (target) go(target.slug);
      else goToSearchPage();
      return;
    }
    if (!open || results.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative w-full" role="search">
      <label htmlFor="site-search" className="sr-only">
        Buscar produtos
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id="site-search"
          type="search"
          autoComplete="off"
          placeholder="Buscar produto…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls={showDropdown ? "site-search-results" : undefined}
          className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      {showDropdown && (
        <ul
          id="site-search-results"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded border border-slate-200 bg-white py-1 shadow-xl"
        >
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-500">
              Nenhum produto encontrado para “{query.trim()}”.
            </li>
          )}
          {results.map((item, i) => (
            <li key={item.slug}>
              <Link
                href={`/produto/${item.slug}/`}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.slug);
                }}
                onMouseEnter={() => setActive(i)}
                className={`block px-4 py-2.5 text-sm ${
                  i === active ? "bg-brand-50" : ""
                }`}
              >
                {item.code && (
                  <span className="font-semibold text-brand-700">
                    {item.code}{" "}
                  </span>
                )}
                <span className="text-slate-800">{item.name}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {item.shortDescription}
                </span>
              </Link>
            </li>
          ))}
          {allResults.length > 0 && (
            <li className="border-t border-slate-100">
              <Link
                href={`/busca/?q=${encodeURIComponent(query.trim())}`}
                onClick={(e) => {
                  e.preventDefault();
                  goToSearchPage();
                }}
                className="block px-4 py-2.5 text-sm font-semibold text-accent-600"
              >
                {allResults.length === 1
                  ? "Ver página de resultados"
                  : `Ver todos os ${allResults.length} resultados`}
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
