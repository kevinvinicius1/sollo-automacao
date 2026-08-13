import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { siteConfig, whatsappLink } from "../../../site.config";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com a ${siteConfig.name}: solicite orçamentos de produtos pneumáticos pelo WhatsApp, telefone ou e-mail.`,
};

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Contato" }]}
      />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-brand-700">Contato</h1>
      <div className="mt-3 h-1 w-14 bg-accent-500" aria-hidden="true" />
      <p className="mt-3 max-w-2xl text-slate-600">
        Solicite um orçamento ou tire suas dúvidas com a nossa equipe. O canal
        mais rápido é o WhatsApp.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <a
          href={whatsappLink("Olá! Gostaria de solicitar um orçamento.")}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-accent-300"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded bg-brand-50 text-brand-700">
            <WhatsAppIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-bold text-brand-700">WhatsApp</h2>
          <p className="mt-1 text-sm text-slate-600">
            {siteConfig.whatsappPhone}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-600 group-hover:underline">
            Iniciar conversa
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </a>

        <a
          href={`tel:+55${siteConfig.phone.replace(/\D/g, "")}`}
          className="group rounded border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-accent-300"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded bg-brand-50 text-brand-700">
            <Phone className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-bold text-brand-700">Telefone</h2>
          <p className="mt-1 text-sm text-slate-600">{siteConfig.phone}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-600 group-hover:underline">
            Ligar agora
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </a>

        <a
          href={`mailto:${siteConfig.email}`}
          className="group rounded border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-accent-300"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded bg-brand-50 text-brand-700">
            <Mail className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-bold text-brand-700">E-mail</h2>
          <p className="mt-1 break-all text-sm text-slate-600">
            {siteConfig.email}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-600 group-hover:underline">
            Enviar e-mail
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </a>

        <a
          href={siteConfig.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-accent-300"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded bg-brand-50 text-brand-700">
            <MapPin className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-bold text-brand-700">Endereço</h2>
          <p className="mt-1 text-sm text-slate-600">{siteConfig.address}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-600 group-hover:underline">
            Ver no mapa
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </a>
      </div>

      <section className="mt-10 rounded bg-brand-700 p-8 text-center text-white sm:p-10">
        <h2 className="text-xl font-bold sm:text-2xl">
          Precisa de um orçamento?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-brand-100 sm:text-base">
          Envie a lista de itens ou o código do produto e retornaremos com
          condições e prazos.
        </p>
        <a
          href={whatsappLink("Olá! Gostaria de solicitar um orçamento.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded bg-accent-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-600"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Chamar no WhatsApp
        </a>
      </section>

    </div>
  );
}
