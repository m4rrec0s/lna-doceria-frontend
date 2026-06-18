import { Menu, Search, ShoppingBasket, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetClose,
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
      <div className="px-4 h-16 flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={30}
            height={30}
            className="object-contain"
          />
          <h1 className="text-2xl text-rose-500 font-light">
            <strong>LNA</strong> <span className="italic">Doceria</span>
          </h1>
        </Link>

        <div className="flex items-center md:gap-5 gap-2">
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="hidden md:flex items-center relative max-w-xs w-full mx-4">
              <Input
                type="search"
                placeholder="Buscar doces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8 border-rose-200 focus-visible:ring-rose-500"
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCartOpen(true)}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
                      className="text-base font-medium text-gray-700 hover:text-rose-500 transition-colors"
                    >
                      Início
                    </Link>
                  )}
                  <Link
                    href="/about"
                    className="text-base font-medium text-gray-700 hover:text-rose-500 transition-colors"
                  >
                    Sobre Nós
                  </Link>
                  <Link
                    href="/contact"
                    className="text-base font-medium text-gray-700 hover:text-rose-500 transition-colors"
                  >
                    Contato
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isSearchOpen ? "h-14 py-2 border-b" : "h-0",
        )}
      >
        <form onSubmit={handleSearch} className="container mx-auto px-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar doces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 border-rose-200 focus-visible:ring-rose-500"
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
            <SheetContent className="flex h-full w-full flex-col border-l border-zinc-200 bg-white p-0 sm:max-w-lg">
              {/* HEADER */}
              <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white/95 backdrop-blur-md">
                <div className="px-4 py-3.5 sm:px-6 sm:py-4">
                  <SheetHeader>
                    <SheetTitle className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 flex-shrink-0">
                          <ShoppingBasket size={18} />
                        </div>

                        <div className="text-left">
                          <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900">
                            Meu Carrinho
                          </h1>

                          <p className="text-[11px] text-zinc-400 font-medium">
                            {itemCount > 0 ? (
                              <>
                                {itemCount} {itemCount === 1 ? "item" : "itens"}{" "}
                                adicionado(s)
                              </>
                            ) : (
                              "Sacola vazia"
                            )}
                          </p>
                        </div>
                      </div>
                    </SheetTitle>

                    {items.length === 0 && (
                      <SheetDescription className="mt-8 flex flex-col items-center justify-center text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50/70">
                          <ShoppingBasket size={22} className="text-rose-450" />
                        </div>

                        <h2 className="text-sm font-semibold text-zinc-800">
                          Carrinho de doces vazio
                        </h2>

                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-zinc-400">
                          Escolha seus doces favoritos na vitrine para preencher sua sacola.
                        </p>
                      </SheetDescription>
                    )}

                    <SheetClose className="absolute right-4 top-4 rounded-lg p-1 opacity-70 transition-all hover:opacity-100 focus:outline-none hover:bg-zinc-50 disabled:pointer-events-none">
                      <span className="sr-only">Fechar</span>
                      <X className="h-4 w-4" />
                    </SheetClose>
                  </SheetHeader>
                </div>
              </div>

              {/* ITEMS LIST CONTAINER WITH LUXURY FLOAT PADDING */}
              <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-rose-100">
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <CartItem key={item.cartItemId} item={item} />
                  ))}
                </div>
              </div>

              {/* FOOTER */}
              {items.length > 0 && (
                <div className="sticky bottom-0 z-10">
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
