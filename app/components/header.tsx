import { ShoppingBasket } from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const Header = () => {
  return (
    <header className="w-full flex justify-between items-center py-4 px-5 fixed top-0 left-0 bg-black/50 shadow-md z-40 backdrop-blur">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="LNA Doceria" width={40} height={40} />
        <div className="flex flex-col line-clamp-1">
          <span className="text-xl font-bold text-pink-300">LNA</span>
          <span className="text-sm font-bold">Confeitaria</span>
        </div>
      </div>

      <Sheet>
        <SheetTrigger>
          <ShoppingBasket size={24} />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Meu Carrinho</SheetTitle>
            <SheetDescription>
              Seu carrinho está vazio. Adicione delícias para continuar.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
