import { Mail, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig, whatsappLink } from "../../site.config";

export default function Footer() {
  return (
    <footer className="border-t-4 border-accent-500 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Image
            src="/images/brand/logo-dark.png"
            alt={siteConfig.name}
            width={495}
            height={144}
            unoptimized
            className="h-10 w-auto"
          />
          <p className="mt-3 text-sm text-brand-200">{siteConfig.tagline}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200">
            {siteConfig.description}
          </p>
        </div>

        <nav aria-label="Links do rodapé">
          <p className="text-sm font-semibold uppercase tracking-wider text-white">
            Navegação
          </p>
          <div className="mt-2 h-0.5 w-8 bg-accent-300" aria-hidden="true" />
          <ul className="mt-4 space-y-2 text-sm">
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
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white hover:underline"
              >
                <MessageCircle
                  className="h-4 w-4 shrink-0 text-accent-300"
                  aria-hidden="true"
                />
                WhatsApp: {siteConfig.phone}
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
        {/* pr extra no mobile para o botão flutuante de WhatsApp não cobrir o texto */}
        <p className="mx-auto max-w-6xl px-4 py-4 pr-24 text-xs text-brand-300 sm:px-6 sm:pr-24">
          © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
