import Link from "next/link";
import ProductLinesStrip from "@/components/ProductLinesStrip";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-6xl font-bold text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-brand-700 sm:text-3xl">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        Este endereço não existe ou o produto saiu do catálogo. Use a busca no
        topo da página ou navegue pelas linhas de produto.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <Link
          href="/produtos/"
          className="rounded bg-brand-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Ver o catálogo
        </Link>
        <Link
          href="/"
          className="font-medium text-brand-700 underline decoration-accent-300 underline-offset-4 hover:text-brand-500"
        >
          Página inicial
        </Link>
      </div>
      <div className="w-full text-left">
        <ProductLinesStrip />
      </div>
    </div>
  );
}
