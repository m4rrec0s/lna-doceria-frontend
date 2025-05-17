"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        "Mensagem enviada com sucesso! Entraremos em contato em breve."
      );

      // await fetch('/api/send-email', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     ...formData,
      //     to: 'lizandranascimento699@gmail.com'
      //   })
      // });

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error(
        "Não foi possível enviar a mensagem. Por favor, tente novamente ou entre em contato diretamente por WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const createMailtoLink = () => {
    const subject = encodeURIComponent(`Contato pelo site - ${formData.name}`);
    const body = encodeURIComponent(
      `Nome: ${formData.name}\nE-mail: ${formData.email}\nTelefone: ${formData.phone}\n\nMensagem:\n${formData.message}`
    );
    return `mailto:lizandranascimento699@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-pink-500">
        Entre em Contato
      </h1>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8 px-2">
          <h2 className="text-2xl font-semibold mb-6">
            Informações de Contato
          </h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <MessageCircle className="w-6 h-6 text-pink-500 mt-1" />
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <p className="text-gray-600">(83) 98851-1950</p>
                <p className="text-sm text-gray-500">
                  Atendimento: Seg-Sex, 9h-18h
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Mail className="w-6 h-6 text-pink-500 mt-1" />
              <div>
                <h3 className="font-semibold">E-mail</h3>
                <p className="text-gray-600">lizandranascimento699@gmail.com</p>
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
                <p className="text-gray-600">Puxinanã - PB</p>
                <p className="text-sm text-gray-500">
                  Obs: Ainda não temos entrega, <br />
                  mas estamos trabalhando nisso!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Contato */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Envie sua Mensagem</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                className="border-pink-200 focus-visible:ring-pink-500"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="border-pink-200 focus-visible:ring-pink-500"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                className="border-pink-200 focus-visible:ring-pink-500"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <textarea
                id="message"
                rows={4}
                placeholder="Como podemos ajudar?"
                className="w-full rounded-md border border-pink-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
              </Button>

              <a
                href={createMailtoLink()}
                className="text-center text-sm text-gray-500 hover:text-pink-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Se preferir, clique aqui para enviar um e-mail diretamente
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
