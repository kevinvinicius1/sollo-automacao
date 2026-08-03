/**
 * Identidade e contatos do revendedor.
 * PLACEHOLDERS: substituir quando o cliente fornecer marca, WhatsApp,
 * telefone, e-mail, endereço e domínio definitivos.
 */
export const siteConfig = {
  name: "Sollo Automação Industrial",
  tagline: "Automação pneumática industrial",
  description:
    "Catálogo completo de produtos pneumáticos: cilindros, válvulas, preparação de ar, conexões e acessórios. Solicite seu orçamento pelo WhatsApp.",
  /** Somente dígitos, com DDI. Ex.: 5517999999999 */
  whatsapp: "5500000000000",
  phone: "(00) 0000-0000",
  email: "contato@exemplo.com.br",
  address: "Endereço do revendedor — Cidade/UF",
  /** Domínio final do site (usado em metadata/sitemap). */
  url: "https://www.example.com.br",
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
  },
} as const;

/** Monta link wa.me com mensagem pré-preenchida. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${siteConfig.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Linhas em prévia ("Trabalho em andamento"): o card aparece marcado e a
 * página da linha mostra um aviso no lugar dos produtos, que ficam fora do
 * build (páginas, busca, sitemap). Os JSONs em data/ não são afetados.
 * Para publicar uma linha, basta removê-la desta lista.
 */
export const wipCategories: string[] = ["preparacao-do-ar", "conexoes"];

export function isWipCategory(slug: string): boolean {
  return wipCategories.includes(slug);
}

/** Slugs exibidos na vitrine "Produtos em destaque" da home. */
export const featuredProducts: string[] = [
  "fcmk-cilindro-perfil-mickey-mouse-iso",
  "valvulas-iso",
  "registro-esfera-alavanca-curta-mini",
  "sensor-bks81",
  "valvula-angular-latao-zfa",
  "valvulas-vf",
  "ponteira-garfo",
  "valvulas-botao-2-2",
];
