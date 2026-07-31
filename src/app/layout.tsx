import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getProducts } from "@/lib/catalog";
import { siteConfig } from "../../site.config";
import "./globals.css";

/* Grotesca de corte industrial — personalidade sem sair do sóbrio */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0967",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lista leve para a busca client-side no header
  const products = await getProducts();
  const searchItems = products.map((p) => ({
    code: p.code,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
  }));

  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded bg-white px-4 py-2 font-medium text-brand-700 shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Pular para o conteúdo
        </a>
        <Header searchItems={searchItems} />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
