import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Faixa full-bleed atrás do título de uma seção/página (e do link "Voltar"):
 * azul profundo com detalhes em bordô (barra à esquerda do título e filete
 * de fechamento). Usada nas listagens de linhas, sublinhas e produtos e na
 * vitrine da home, sempre logo abaixo do banner — o fundo da imagem não muda.
 */
export default function PageTitleBar({
  title,
  backHref,
  as: Heading = "h1",
  id,
}: {
  title: string;
  /** Quando informado, mostra o link "Voltar" à direita do título. */
  backHref?: string;
  /** Nível do título: h1 nas páginas internas, h2 quando é uma seção. */
  as?: "h1" | "h2";
  /** Id do título (para `aria-labelledby` da seção que o contém). */
  id?: string;
}) {
  return (
    <section className="border-b-4 border-accent-500 bg-brand-800 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-5 sm:px-6">
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
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 text-accent-300" aria-hidden="true" />
            Voltar
          </Link>
        )}
      </div>
    </section>
  );
}
