import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import WhatsAppIcon from "./WhatsAppIcon";
import { siteConfig, whatsappLink } from "../../site.config";

/** Ícone do Instagram no traço do Lucide (a lib removeu os ícones de marca). */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100 md:flex">
      <div className="min-w-0 flex-1">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 md:grid-cols-3">
          <div>
            <Image
              src="/images/brand/logo-dark.png"
              alt={siteConfig.name}
              width={495}
              height={144}
              unoptimized
              className="h-20 w-auto"
            />
          </div>

          <nav aria-label="Links do rodapé">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Navegação
            </p>
            <div className="mt-2 h-0.5 w-8 bg-accent-300" aria-hidden="true" />
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos/"
                  className="hover:text-white hover:underline"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/contato/"
                  className="hover:text-white hover:underline"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </nav>

          <address className="not-italic">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Contato
            </p>
            <div className="mt-2 h-0.5 w-8 bg-accent-300" aria-hidden="true" />
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white hover:underline"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-accent-300" />
                  WhatsApp: {siteConfig.whatsappPhone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:+55${siteConfig.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 hover:text-white hover:underline"
                >
                  <Phone
                    className="h-4 w-4 shrink-0 text-accent-300"
                    aria-hidden="true"
                  />
                  Telefone: {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center gap-2 hover:text-white hover:underline"
                >
                  <Mail
                    className="h-4 w-4 shrink-0 text-accent-300"
                    aria-hidden="true"
                  />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent-300"
                  aria-hidden="true"
                />
                {siteConfig.address}
              </li>
            </ul>
          </address>
        </div>

        <div className="border-t border-brand-800">
          <p className="mx-auto max-w-6xl px-4 py-3 text-xs text-brand-300 sm:px-6">
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos
            reservados.
          </p>
        </div>
      </div>

      {/* Coluna bordô das redes sociais (vira faixa no mobile) */}
      <div className="flex items-center justify-center gap-6 bg-accent-600 px-8 py-3 text-white md:py-0">
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="rounded p-2 transition-colors hover:bg-accent-500"
        >
          <InstagramIcon className="h-6 w-6" />
        </a>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="rounded p-2 transition-colors hover:bg-accent-500"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      </div>
    </footer>
  );
}
