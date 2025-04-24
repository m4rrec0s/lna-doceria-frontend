"use client";

import { Button } from "@/app/components/ui/button";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/558388511950?text=Olá! Gostaria de saber mais sobre os doces da LNA Doceria.",
      "_blank"
    );
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600 shadow-lg"
    >
      <MessageCircle className="h-6 w-6 text-white" />
      <span className="sr-only">Contato via WhatsApp</span>
    </Button>
  );
}
