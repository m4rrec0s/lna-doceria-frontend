import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-pink-500">
        Entre em Contato
      </h1>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Informações de Contato */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold mb-6">
            Informações de Contato
          </h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <MessageCircle className="w-6 h-6 text-pink-500 mt-1" />
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <p className="text-gray-600">(11) 99999-9999</p>
                <p className="text-sm text-gray-500">
                  Atendimento: Seg-Sáb, 9h-18h
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Mail className="w-6 h-6 text-pink-500 mt-1" />
              <div>
                <h3 className="font-semibold">E-mail</h3>
                <p className="text-gray-600">contato@lnadoceria.com.br</p>
                <p className="text-sm text-gray-500">
                  Respondemos em até 24h úteis
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Instagram className="w-6 h-6 text-pink-500 mt-1" />
              <div>
                <h3 className="font-semibold">Instagram</h3>
                <p className="text-gray-600">@lnadoceria</p>
                <p className="text-sm text-gray-500">
                  Siga-nos para novidades!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-pink-500 mt-1" />
              <div>
                <h3 className="font-semibold">Região de Atendimento</h3>
                <p className="text-gray-600">São Paulo - SP</p>
                <p className="text-sm text-gray-500">
                  Entregamos em toda região metropolitana
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Contato */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Envie sua Mensagem</h2>

          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                className="border-pink-200 focus-visible:ring-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="border-pink-200 focus-visible:ring-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                className="border-pink-200 focus-visible:ring-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <textarea
                id="message"
                rows={4}
                placeholder="Como podemos ajudar?"
                className="w-full rounded-md border border-pink-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600"
            >
              Enviar Mensagem
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
