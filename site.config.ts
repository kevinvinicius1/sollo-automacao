/**
 * Identidade e contatos do revendedor.
 * PLACEHOLDER restante: domínio definitivo (url) e logotipo.
 */
export const siteConfig = {
  name: "Sollo Automação Industrial",
  /** Razão social e CNPJ (rodapé). */
  legalName: "Sollo Automacao Industrial LTDA",
  cnpj: "22.651.099/0001-24",
  /** Horário de funcionamento (rodapé), em duas linhas. */
  hours: ["De segunda a sexta-feira,", "das 08:00 às 18:00"],
  tagline: "Automação pneumática industrial",
  description:
    "Catálogo completo de produtos pneumáticos: cilindros, válvulas, preparação de ar, conexões e acessórios. Solicite seu orçamento pelo WhatsApp.",
  /** Somente dígitos, com DDI. */
  whatsapp: "553433065001",
  /** Número do WhatsApp para exibição. */
  whatsappPhone: "(34) 3306-5001",
  /** Segundo número, também com WhatsApp. Somente dígitos, com DDI. */
  phoneWhatsapp: "553433065000",
  /** Segundo número para exibição. */
  phone: "(34) 3306-5000",
  email: "sollo@solloautomacao.com",
  address: "Rua Aurora, 95 — Nossa Sra. das Graças, Uberlândia/MG, CEP 38402-168",
  mapsUrl:
    "https://www.google.com/maps/place/Sollo+Automa%C3%A7%C3%A3o+Industrial+Ltda+-+Stara+Automa%C3%A7%C3%A3o/data=!4m2!3m1!1s0x0:0x8795f7fac61a9254",
  /** Domínio final do site (usado em metadata/sitemap). */
  url: "https://www.example.com.br",
  social: {
    instagram: "https://www.instagram.com/sollo_automacao",
    facebook: "",
    linkedin: "",
  },
} as const;

/** Monta link wa.me com mensagem pré-preenchida (número principal por padrão). */
export function whatsappLink(
  message?: string,
  number: string = siteConfig.whatsapp,
): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Linhas em prévia ("Trabalho em andamento"): o card aparece marcado e a
 * página da linha mostra um aviso no lugar dos produtos, que ficam fora do
 * build (páginas, busca, sitemap). Os JSONs em data/ não são afetados.
 * Para publicar uma linha, basta removê-la desta lista.
 */
export const wipCategories: string[] = [];

export function isWipCategory(slug: string): boolean {
  return wipCategories.includes(slug);
}
