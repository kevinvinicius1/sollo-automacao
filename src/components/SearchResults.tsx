"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProductCard, { type ProductCardData } from "./ProductCard";
import { buildSearchIndex, searchProducts } from "@/lib/search";

/** Resultados da página /busca (client-side: o site é 100% estático). */
export default function SearchResults({ items }: { items: ProductCardData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  // Campo local para refinar a busca sem perder o que veio na URL
  const [input, setInput] = useState(query);
  useEffect(() => setInput(query), [query]);

  const fuse = useMemo(() => buildSearchIndex(items), [items]);
  const results = useMemo(
    () => searchProducts(fuse, query),
    [fuse, query]
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (q.length < 2) return;
    router.push(`/busca/?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="mt-8">
      <form onSubmit={submit} role="search" className="flex max-w-xl gap-2">
        <label htmlFor="busca-page-input" className="sr-only">
          Buscar produtos
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="busca-page-input"
            type="search"
            autoComplete="off"
            placeholder="Buscar produto…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Buscar
        </button>
      </form>

      {query.length < 2 ? (
        <p className="mt-8 text-slate-600">
          Digite ao menos 2 caracteres para buscar por nome, código de série
          ou descrição.
        </p>
      ) : results.length > 0 ? (
        <>
          <p className="mt-8 text-slate-600" role="status">
            {results.length === 1
              ? `1 produto encontrado para `
              : `${results.length} produtos encontrados para `}
            <strong className="text-slate-900">“{query}”</strong>
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-8 rounded border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900" role="status">
            Nenhum produto encontrado para “{query}”.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            Confira a grafia ou tente buscar pelo código de série impresso no
            produto. Você também pode navegar pelas linhas do catálogo.
          </p>
          <Link
            href="/produtos/"
            className="mt-5 inline-flex items-center rounded bg-brand-700 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Ver o catálogo
          </Link>
        </div>
      )}
    </div>
  );
}
