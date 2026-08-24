import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Breadcrumb, { type Crumb } from "@/components/Breadcrumb";

/**
 * Faixa full-bleed atrás do título de uma seção/página (e do link "Voltar"):
 * azul profundo com detalhes em bordô (barra à esquerda do título e filete
 * de fechamento). Usada nas listagens de linhas, sublinhas e produtos e na
 * vitrine da home, sempre logo abaixo do banner — o fundo da imagem não muda.
 *
 * Com `crumbs`, a trilha de navegação entra dentro da própria faixa, acima
 * do título, como na página de produto; o "Voltar" acompanha a trilha. Sem
 * `crumbs` (caso da vitrine da home), a faixa fica em uma linha só.
 */
export default function PageTitleBar({
  title,
  crumbs,
  backHref,
  as: Heading = "h1",
  id,
}: {
  title: string;
  /** Trilha de navegação exibida dentro da faixa, acima do título. */
  crumbs?: Crumb[];
  /** Quando informado, mostra o link "Voltar" à direita. */
  backHref?: string;
  /** Nível do título: h1 nas páginas internas, h2 quando é uma seção. */
  as?: "h1" | "h2";
  /** Id do título (para `aria-labelledby` da seção que o contém). */
  id?: string;
}) {
  /*
   * Botão sólido, e não texto: em cima da faixa azul o "Voltar" ficava do
   * mesmo tamanho e quase da mesma cor da trilha ao lado, e sumia.
   */
  const voltar = backHref && (
    <Link
      href={backHref}
      className="inline-flex items-center gap-1.5 rounded bg-accent-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Voltar
    </Link>
  );

  return (
    <section className="border-b-4 border-accent-500 bg-brand-800 text-white">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        {/* gap-y maior que o gap-x: no celular a trilha ocupa a linha inteira
            e o botão desce, e com folga de 4px ele colava nela. */}
        {crumbs && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <Breadcrumb items={crumbs} tone="dark" />
            {voltar}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <div className="flex items-center gap-3">
            <span
              className="h-7 w-1.5 shrink-0 bg-accent-500"
              aria-hidden="true"
            />
            <Heading
              id={id}
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {title}
            </Heading>
          </div>
          {!crumbs && voltar}
        </div>
      </div>
    </section>
  );
}
