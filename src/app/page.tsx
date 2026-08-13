import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import CategoryCard from "@/components/CategoryCard";
import { getCategories } from "@/lib/catalog";
import { isWipCategory, siteConfig, whatsappLink } from "../../site.config";

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
      {/* Hero full-width */}
      <section className="bg-brand-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-300">
              Componentes pneumáticos industriais
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Cilindros, válvulas e preparação de ar para a sua indústria
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
        </div>
      </section>

      {/* Vitrine de linhas de produto */}
      <section
        aria-labelledby="linhas-heading"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
      >
        <h2
          id="linhas-heading"
          className="text-2xl font-bold tracking-tight text-brand-700 sm:text-3xl"
        >
          Linha de Produtos
        </h2>
        <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              name={cat.name}
              href={`/produtos/${cat.slug}/`}
              image={cat.image}
              wip={isWipCategory(cat.slug)}
            />
          ))}
        </div>
      </section>

      {/* Como pedir orçamento — sequência real do fluxo de compra */}
      <section aria-labelledby="como-comprar-heading">
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
