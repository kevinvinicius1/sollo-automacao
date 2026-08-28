"use client";

import { Menu, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "../../site.config";
import SearchBox, { type SearchItem } from "./SearchBox";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/produtos/", label: "Produtos" },
  { href: "/contato/", label: "Contato" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.replace(/\/$/, ""));
}

export default function Header({ searchItems }: { searchItems: SearchItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-800 bg-brand-700 text-white shadow-md">
      {/* Filete bordô de identidade no topo */}
      <div className="h-1 bg-accent-500" aria-hidden="true" />
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-4 px-4 sm:px-6 md:h-24">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={`${siteConfig.name} — página inicial`}
        >
          <Image
            src="/images/brand/logo-dark.png"
            alt={siteConfig.name}
            width={495}
            height={144}
            unoptimized
            priority
            className="h-14 w-auto sm:h-16 md:h-[4.5rem]"
          />
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <div className="w-full max-w-sm">
            <SearchBox items={searchItems} />
          </div>
        </div>

        <nav aria-label="Navegação principal" className="hidden self-stretch md:block">
          <ul className="flex h-full items-stretch">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="flex">
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={`flex items-center px-4 text-sm font-medium transition-colors ${
                    isActive(pathname, link.href)
                      ? "bg-accent-500 text-white"
                      : "text-brand-100 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Só a partir de lg: entre md e lg não sobra largura ao lado do menu
            (logo + busca + menu já ocupam a faixa). No mobile a frase entra
            no fim do menu hambúrguer. O ml-8 afasta a frase dos itens do
            menu, deixando-a mais solta no canto direito (pedido do cliente:
            estava "colada" nos botões). */}
        <p className="ml-8 hidden shrink-0 items-center gap-2 text-sm font-medium text-white lg:flex">
          <Truck className="h-5 w-5" aria-hidden="true" />
          Enviamos para todo o Brasil!
        </p>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          className="ml-auto flex h-11 w-11 items-center justify-center text-white hover:bg-brand-600 md:hidden"
        >
          {menuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-brand-600 bg-brand-700 px-4 pb-4 pt-3 md:hidden"
        >
          <div className="mb-3">
            <SearchBox
              items={searchItems}
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
          <nav aria-label="Navegação principal (mobile)">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={
                      isActive(pathname, link.href) ? "page" : undefined
                    }
                    className={`block px-3 py-3 text-base font-medium ${
                      isActive(pathname, link.href)
                        ? "bg-accent-500 text-white"
                        : "text-brand-100 hover:bg-brand-600 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-3 flex items-center gap-2 border-t border-brand-600 px-3 pt-3 text-sm font-medium text-white">
            <Truck className="h-5 w-5" aria-hidden="true" />
            Enviamos para todo o Brasil!
          </p>
        </div>
      )}
    </header>
  );
}
