import { ChevronRight, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import CategoryCard from "@/components/CategoryCard";
import { getCategories, getProducts } from "@/lib/catalog";
import { siteConfig, whatsappLink } from "../../site.config";

export default async function HomePage() {
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <>
      {/* Hero: tese concreta + acesso direto às linhas do catálogo */}
      <section className="bg-brand-800 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_20rem] lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-300">
              Componentes pneumáticos industriais
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Cilindros, válvulas e preparação de ar para manutenção e OEM
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-brand-100">
              Catálogo técnico com especificações e códigos de série. Encontre
              o item, envie o código pelo WhatsApp e receba preço e prazo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappLink("Olá! Gostaria de solicitar um orçamento.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded bg-accent-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-600"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Pedir orçamento no WhatsApp
              </a>
              <Link
                href="/produtos/"
                className="inline-flex items-center gap-2 rounded bg-white px-6 py-3 font-semibold text-brand-800 transition-colors hover:bg-brand-50"
              >
                Ver o catálogo
              </Link>
            </div>
          </div>

          {/* Acesso direto às linhas — conteúdo real, não decoração */}
          <nav
            aria-label="Linhas de produto"
            className="rounded bg-brand-900 p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">
              Linhas de produto
            </p>
            <ul className="mt-3 divide-y divide-brand-800">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/produtos/${cat.slug}/`}
                    className="group flex items-center justify-between gap-2 py-3 text-sm font-medium text-brand-100 transition-colors hover:text-white"
                  >
                    {cat.name}
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-accent-300 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Categorias */}
      <section
        aria-labelledby="categorias-heading"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
      >
        <h2
          id="categorias-heading"
          className="text-2xl font-bold tracking-tight text-brand-700 sm:text-3xl"
        >
          Catálogo por linha
        </h2>
        <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />
        <p className="mt-3 max-w-2xl text-slate-600">
          {products.length > 0
            ? `${products.length} ${products.length === 1 ? "produto" : "produtos"} com especificações técnicas completas, organizados em ${categories.length} linhas.`
            : "Produtos com especificações técnicas completas, organizados por linha."}
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              name={cat.name}
              href={`/produtos/${cat.slug}/`}
              image={cat.image}
            />
          ))}
        </div>
      </section>

      {/* Como pedir orçamento — sequência real do fluxo de compra */}
      <section
        aria-labelledby="como-comprar-heading"
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2
                id="como-comprar-heading"
                className="text-2xl font-bold tracking-tight text-brand-700 sm:text-3xl"
              >
                Sobre a {siteConfig.name}
              </h2>
              <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />
              {/* PLACEHOLDER: substituir pelo texto institucional definitivo do cliente */}
              <p className="mt-4 leading-relaxed text-slate-600">
                A {siteConfig.name} fornece componentes pneumáticos para
                manutenção industrial e fabricantes de máquinas. Atendemos
                desde a reposição de um item avulso até o fornecimento
                recorrente para linhas de produção.
              </p>
              <p className="mt-3 leading-relaxed text-slate-600">
                A equipe comercial apoia a especificação: se você tem o código
                do item, o desenho da aplicação ou só o problema a resolver,
                retornamos com a opção adequada, preço e prazo.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-700">
                Como pedir um orçamento
              </h3>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    title: "Encontre o item no catálogo",
                    text: "Use a busca por nome ou código de série, ou navegue pelas linhas.",
                  },
                  {
                    title: "Envie o código pelo WhatsApp",
                    text: "O botão de orçamento em cada produto já preenche a mensagem com o código.",
                  },
                  {
                    title: "Receba preço e prazo",
                    text: "A equipe comercial retorna com condições de fornecimento.",
                  },
                ].map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand-700 text-sm font-bold text-white"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {step.title}
                      </h4>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA orçamento */}
      <section
        aria-labelledby="orcamento-heading"
        className="bg-brand-700 text-white"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <h2
            id="orcamento-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Precisa cotar uma lista de itens?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Envie os códigos e as quantidades. Retornamos com preço, prazo e
            condições de fornecimento.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <a
              href={whatsappLink("Olá! Gostaria de cotar uma lista de itens.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-accent-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-600"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp: {siteConfig.phone}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 font-medium text-brand-100 underline decoration-accent-300 underline-offset-4 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {siteConfig.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
