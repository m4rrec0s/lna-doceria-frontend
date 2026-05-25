"use client";

import { Button } from "@/app/components/ui/button";
import WhatsappIcon from "@/public/whatsappIcon";

export function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/558388511950?text=Olá! Gostaria de saber mais sobre os doces da LNA Doceria.",
      "_blank",
    );
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600 shadow-lg"
    >
      <WhatsappIcon size={30} color="#ffffff" />
      <span className="sr-only">Contato via WhatsApp</span>
    </Button>
  );
}
