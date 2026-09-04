import CategoryCard from "@/components/CategoryCard";
import HomeCarousel from "@/components/HomeCarousel";
import PageTitleBar from "@/components/PageTitleBar";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getCategories } from "@/lib/catalog";
import { isWipCategory, whatsappLink } from "../../site.config";

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
      {/* Hero: faixa azul com texto e carrossel, seguindo direto na vitrine
          de linhas (fechada pelo filete bordô da PageTitleBar). O botão fica
          numa coluna à direita, centralizado na altura do bloco de texto —
          na prática, na altura das frases do subtítulo (pedido do cliente).
          A faixa é compacta de propósito: o carrossel precisa aparecer na
          primeira dobra, sem rolagem. */}
      <section className="bg-brand-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
            <div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Automação industrial é com a Sollo
              </h1>
              <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />
              {/* As duas frases são assuntos distintos — a relação com a
                  Gefran e o que a linha pneumática cobre —, então cada uma
                  abre uma linha em vez de correrem emendadas. */}
              <p className="mt-3 max-w-2xl leading-relaxed text-brand-100">
                <span className="block">
                  Distribuidor exclusivo <strong className="font-bold text-white">GEFRAN</strong> no
                  Brasil.
                </span>
                <span className="block">
                  Linha pneumática: cilindros, válvulas, conexões e preparação
                  de ar.
                </span>
              </p>
            </div>
            <a
              href={whatsappLink("Olá! Gostaria de entrar em contato.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded bg-accent-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-600 md:self-center"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Entre em Contato
            </a>
          </div>

          {/* Carrossel na proporção original dos banners (27:10), sem corte
              nem distorção. A largura é limitada pela altura da janela
              (proporção 27:10 => altura disponível × 2.7) para o banner
              inteiro caber na primeira dobra em monitor baixo; 22rem ≈
              header + texto do hero + respiros + marcadores. Em janela alta
              o max(66%) nem chega a agir e o carrossel fica na largura cheia
              do contêiner. */}
          <div className="mt-6">
            <div
              className="mx-auto"
              style={{
                width: "min(100%, max(66%, calc((100svh - 22rem) * 2.7)))",
              }}
            >
              <HomeCarousel slides={heroSlides} />
            </div>
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

      {/* Como pedir um orçamento — faixa azul que separa a vitrine do texto institucional */}
      <section
        aria-labelledby="como-comprar-heading"
        className="bg-brand-700 text-white"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2
            id="como-comprar-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Como pedir um orçamento
          </h2>
          <div className="mt-3 h-1 w-14 bg-accent-300" aria-hidden="true" />
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Encontre o item no catálogo",
                text: "Use a busca por nome ou código, ou navegue pelas linhas de produtos.",
              },
              {
                title: "Envie o código pelo WhatsApp",
                text: "O botão em cada produto já abre a conversa com o código preenchido.",
              },
              {
                title: "Receba preço e prazo",
                text: "A equipe comercial retorna com as condições de fornecimento.",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-accent-500 text-base font-bold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-brand-100">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Institucional */}
      <section aria-labelledby="sobre-heading">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-3xl">
            <h2
              id="sobre-heading"
              className="text-2xl font-bold tracking-tight text-brand-700 sm:text-3xl"
            >
              Conheça nossa empresa
            </h2>
            <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />
            <p className="mt-4 text-lg font-semibold text-brand-700">
              Distribuidor Autorizado <strong className="font-bold">GEFRAN</strong>
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Em 2015, a{" "}
              <strong className="font-semibold text-slate-800">
                Sollo Automação Industrial Ltda.
              </strong>{" "}
              iniciou sua trajetória como distribuidora de produtos para
              automação industrial, atendendo clientes em diversas regiões do
              Brasil. Ao longo dos anos, nosso compromisso com o trabalho e a
              excelência impulsionou nosso crescimento contínuo.
            </p>
            <p className="mt-3 leading-relaxed text-slate-600">
              Com a confiança de nossos clientes, conquistamos novos parceiros
              e mercados, ampliando nossa linha de produtos com qualidade e
              preços competitivos.
            </p>
            <p className="mt-3 leading-relaxed text-slate-600">
              Nosso diferencial está em um atendimento próximo, ágil e
              transparente, buscando entender a necessidade de cada cliente e
              indicar produtos adequados para sua aplicação.
            </p>
            <p className="mt-3 leading-relaxed text-slate-600">
              Estamos prontos para atender sua empresa e encontrar a melhor
              solução para sua aplicação.
            </p>
          </div>
        </div>
      </section>

    </>
  );
}
