import { Clock, MapPin, Phone } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-pink-500">
        Sobre a LNA Doceria
      </h1>

      <div className="max-w-3xl mx-auto">
        <div className="prose prose-pink lg:prose-lg mx-auto">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Nossa História</h2>
            <p className="text-gray-600 mb-4">
              Fundada em 2020, a LNA Doceria nasceu do amor pela confeitaria e
              do desejo de levar momentos de felicidade através dos nossos doces
              artesanais. Nossa jornada começou na cozinha de casa e hoje somos
              referência em doces finos e sobremesas personalizadas.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Nossa Missão</h2>
            <p className="text-gray-600 mb-4">
              Proporcionar experiências únicas através de doces artesanais de
              alta qualidade, feitos com muito amor e dedicação, tornando
              momentos especiais ainda mais memoráveis.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Nossos Valores</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Qualidade dos ingredientes</li>
              <li>Atendimento personalizado</li>
              <li>Compromisso com a satisfação</li>
              <li>Inovação em sabores</li>
              <li>Responsabilidade na produção</li>
            </ul>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-pink-50 rounded-lg">
              <MapPin className="w-8 h-8 text-pink-500 mb-4" />
              <h3 className="font-semibold mb-2">Localização</h3>
              <p className="text-gray-600">
                Atendemos em toda região de São Paulo
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-pink-50 rounded-lg">
              <Clock className="w-8 h-8 text-pink-500 mb-4" />
              <h3 className="font-semibold mb-2">Horário</h3>
              <p className="text-gray-600">
                Segunda a Sábado
                <br />
                9h às 18h
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-pink-50 rounded-lg">
              <Phone className="w-8 h-8 text-pink-500 mb-4" />
              <h3 className="font-semibold mb-2">Contato</h3>
              <p className="text-gray-600">
                WhatsApp:
                <br />
                (11) 99999-9999
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
