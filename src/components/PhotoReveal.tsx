import Image from "next/image";

/**
 * Painel com a esfera da marca que cobre a foto do card e sobe como
 * cortina no hover/foco do teclado, revelando a imagem. Renderiza só em
 * dispositivos com hover (variante can-hover); no toque a foto fica
 * sempre visível. Usar dentro de um contêiner `relative overflow-hidden`
 * cujo link/botão ancestral tenha a classe `group`.
 */
export default function PhotoReveal() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center bg-brand-700 transition-transform duration-300 ease-out group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none can-hover:flex"
    >
      <Image
        src="/images/brand/esfera.png"
        alt=""
        width={192}
        height={192}
        unoptimized
        className="h-14 w-14"
      />
    </span>
  );
}
