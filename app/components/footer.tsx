import Link from "next/link";
import { Instagram } from "lucide-react";
import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-pink-500">LNA Doceria</h3>
            <p className="text-gray-600 text-sm">
              Doces artesanais feitos com amor e os melhores ingredientes para
              tornar seus momentos ainda mais especiais.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                asChild
              >
                <Link
                  href={"https://www.instagram.com/lna.doceria/"}
                  target="_blank"
                >
                  <Instagram className="h-4 w-4 text-pink-500" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              {/* <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <Facebook className="h-4 w-4 text-pink-500" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <Twitter className="h-4 w-4 text-pink-500" />
                <span className="sr-only">Twitter</span>
              </Button> */}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
              Produtos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-pink-500 text-sm"
                >
                  Brigadeiros
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-pink-500 text-sm"
                >
                  Trufas
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-pink-500 text-sm"
                >
                  Doces Especiais
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
              Informações
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-pink-500 text-sm"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-pink-500 text-sm"
                >
                  Contato
                </Link>
              </li>
              {/* <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-pink-500 text-sm"
                >
                  Política de Entrega
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-pink-500 text-sm"
                >
                  Termos e Condições
                </Link>
              </li> */}
            </ul>
          </div>

          {/* <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
              Newsletter
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Inscreva-se para receber novidades e promoções exclusivas.
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Seu e-mail"
                className="border-pink-200 focus-visible:ring-pink-500"
              />
              <Button className="w-full bg-pink-500 hover:bg-pink-600">
                Inscrever-se
              </Button>
            </form>
          </div> */}
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} LNA Doceria. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
