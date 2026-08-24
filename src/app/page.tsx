import { Mail } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import HomeCarousel from "@/components/HomeCarousel";
import PageTitleBar from "@/components/PageTitleBar";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getCategories } from "@/lib/catalog";
import { isWipCategory, siteConfig, whatsappLink } from "../../site.config";

export default async function HomePage() {
  const categories = await getCategories();

  /*
   * O carrossel alterna os dois fabricantes a cada slide — Gefran, Fluir,
   * Gefran, Fluir —, cada um na ordem em que suas linhas aparecem na vitrine
   * logo abaixo. Sem isso o carrossel mostraria as quatro linhas Gefran em
   * sequência e só depois as quatro pneumáticas, dando a impressão de dois
   * catálogos separados.
   */
  const visiveis = categories.filter(
    (cat) => cat.heroImage && !isWipCategory(cat.slug)
  );
  const gefran = visiveis.filter((cat) => cat.brand === "Gefran");
  const fluir = visiveis.filter((cat) => cat.brand !== "Gefran");
  const heroSlides = Array.from(
    { length: Math.max(gefran.length, fluir.length) },
    (_, i) => [gefran[i], fluir[i]]
  )
    .flat()
    .filter((cat) => cat !== undefined)
    .map((cat) => ({ name: cat.name, image: cat.heroImage! }));

  return (
    <>
      {/* Hero: título sobre o carrossel, exibido na proporção original dos
          banners (27:10) para não haver corte nem distorção da imagem. A
          faixa segue direto na vitrine de linhas, fechada pelo filete bordô
          da PageTitleBar. */}
      <section className="bg-brand-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Cilindros, válvulas e preparação de ar para a sua indústria
          </h1>
          <div className="mt-4 h-1 w-14 bg-accent-500" aria-hidden="true" />
          <div className="mt-8 aspect-[27/10] overflow-hidden rounded bg-white">
            <HomeCarousel slides={heroSlides} />
          </div>
        </div>
      </section>

      {/* Vitrine de linhas de produto */}
      <section aria-labelledby="linhas-heading">
        <PageTitleBar title="Linha de Produtos" as="h2" id="linhas-heading" />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp: {siteConfig.whatsappPhone}
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
