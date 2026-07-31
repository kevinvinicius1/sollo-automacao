/**
 * Identidade e contatos do revendedor.
 * PLACEHOLDERS: substituir quando o cliente fornecer marca, WhatsApp,
 * telefone, e-mail, endereço e domínio definitivos.
 */
export const siteConfig = {
  name: "Sollo Automação",
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
