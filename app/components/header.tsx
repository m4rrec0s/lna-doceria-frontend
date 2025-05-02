import { Menu, Search, ShoppingBasket, ShoppingCart } from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCart } from "../context/CartContext";
import CartItem from "./cart/CartItem";
import CartSummary from "./cart/CartSummary";
import { cn } from "../lib/utils";
import { DialogTitle } from "./ui/dialog";

interface HeaderProps {
  showSearch?: boolean;
}

const Header = ({ showSearch = false }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearchOpen, setIsSearchOpen] = useState(showSearch);
  const [searchTerm, setSearchTerm] = useState("");
  const { items, isCartOpen, setIsCartOpen } = useCart();
  const itemCount = items.length;

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={30}
            height={30}
            className="object-contain"
          />
          <span className="text-2xl font-bold text-pink-500">LNA Doceria</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {pathname !== "/" && (
            <Link
              href="/"
              className="text-base font-medium text-gray-700 hover:text-pink-500 transition-colors"
            >
              Início
            </Link>
          )}
          <Link
            href="/about"
            className="text-base font-medium text-gray-700 hover:text-pink-500 transition-colors"
          >
            Sobre Nós
          </Link>
          <Link
            href="/contact"
            className="text-base font-medium text-gray-700 hover:text-pink-500 transition-colors"
          >
            Contato
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="hidden md:block">
          <div className="hidden md:flex items-center relative max-w-xs w-full mx-4">
            <Input
              type="search"
              placeholder="Buscar doces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 border-pink-200 focus-visible:ring-pink-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Pesquisar"
              title="Pesquisar"
            >
              <Search className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </form>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <Search className="h-5 w-5 text-gray-700" />
          <span className="sr-only">Buscar</span>
        </Button>

        {(pathname === "/" || pathname !== "/dashboard") && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">Carrinho</span>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-gray-700" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  <DialogTitle>Menu</DialogTitle>
                  <nav className="flex flex-col space-y-4 py-6">
                    {pathname !== "/" && (
                      <Link
                        href="/"
                        className="text-base font-medium text-gray-700 hover:text-pink-500 transition-colors"
                      >
                        Início
                      </Link>
                    )}
                    <Link
                      href="/about"
                      className="text-base font-medium text-gray-700 hover:text-pink-500 transition-colors"
                    >
                      Sobre Nós
                    </Link>
                    <Link
                      href="/contact"
                      className="text-base font-medium text-gray-700 hover:text-pink-500 transition-colors"
                    >
                      Contato
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isSearchOpen ? "h-14 py-2 border-b" : "h-0"
        )}
      >
        <form onSubmit={handleSearch} className="container mx-auto px-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar doces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 border-pink-200 focus-visible:ring-pink-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Pesquisar"
              title="Pesquisar"
            >
              <Search className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
        {!isSearchOpen && (
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="w-full max-w-md max-w-sm: sm:max-w-lg flex flex-col h-full p-0">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingBasket size={20} />
                    Meu Carrinho
                    {itemCount > 0 && (
                      <span className="text-sm text-gray-400">
                        ({itemCount} {itemCount === 1 ? "item" : "itens"})
                      </span>
                    )}
                  </SheetTitle>
                  <SheetDescription className="hidden">
                    Adicione ou remova itens do seu carrinho.
                  </SheetDescription>
                  {items.length === 0 && (
                    <SheetDescription className="text-center py-10">
                      Seu carrinho está vazio. Adicione delícias para continuar.
                    </SheetDescription>
                  )}
                </SheetHeader>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {items.length > 0 && (
                <div className="mt-auto border-t border-gray-700 p-6 bg-background">
                  <CartSummary />
                </div>
              )}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
};

export default Header;
