import WhatsAppIcon from "./WhatsAppIcon";
import { whatsappLink } from "../../site.config";

/** Botão flutuante de WhatsApp, sempre visível no canto inferior direito. */
export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Olá! Gostaria de solicitar um orçamento.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Solicitar orçamento pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-colors hover:bg-[#1fb959]"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
}
