import Image from "next/image";

/**
 * Etiqueta com o logotipo do fabricante no canto da foto de um card. Só a
 * Gefran tem etiqueta: a marca da linha pneumática não é destacada no site.
 * Sempre visível — no celular não há hover, e a etiqueta é informação, não
 * enfeite. Nos cards com cortina (PhotoReveal) ela fica acima da cortina.
 */
const LOGOS: Record<string, { src: string; alt: string; ratio: number }> = {
  Gefran: { src: "/images/brand/gefran.svg", alt: "Gefran", ratio: 8 },
};

export function hasBrandBadge(brand?: string): boolean {
  return brand !== undefined && brand in LOGOS;
}

/** Nome de exibição de uma linha: sem o sufixo da marca, que a etiqueta já diz. */
export function displayName(name: string, brand?: string): string {
  return hasBrandBadge(brand) ? name.replace(/\s*-\s*GEFRAN$/, "") : name;
}

export default function BrandBadge({
  brand,
  size = "md",
}: {
  brand?: string;
  /** `md` nos cards de linha e sublinha; `sm` nos cards de produto, mais estreitos no celular. */
  size?: "md" | "sm";
}) {
  const logo = brand ? LOGOS[brand] : undefined;
  if (!logo) return null;
  const width = size === "md" ? 64 : 52;
  return (
    <span
      className={`absolute left-2 top-2 z-20 flex items-center rounded border border-slate-200 bg-white ${
        size === "md" ? "h-7 px-2" : "h-6 px-1.5"
      }`}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={width}
        height={Math.round(width / logo.ratio)}
        unoptimized
      />
    </span>
  );
}
