import { Search, ShoppingBasket, X } from "lucide-react";
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
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCart } from "../context/CartContext";
import CartItem from "./cart/CartItem";
import CartSummary from "./cart/CartSummary";

interface HeaderProps {
  showSearch?: boolean;
}

const Header = ({ showSearch = false }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(showSearch);
  const [searchTerm, setSearchTerm] = useState("");
  const { items } = useCart();
  const itemCount = items.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="w-full flex justify-between items-center py-4 px-5 fixed top-0 left-0 bg-black/50 shadow-md z-40 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="LNA Doceria" width={40} height={40} />
        <div className="flex flex-col line-clamp-1">
          <span className="text-xl font-bold text-pink-200">LNA</span>
          <span className="text-sm font-bold">Doceria</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <AnimatePresence>
          {isSearchOpen && (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "300px", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="relative"
              onSubmit={handleSearch}
            >
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
                autoFocus
              />
              {!showSearch && (
                <Button
                  type="button"
                  variant={"ghost"}
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X size={18} />
                </Button>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        {!isSearchOpen && (
          <Button variant={"ghost"} onClick={() => setIsSearchOpen(true)}>
            <Search size={24} />
          </Button>
        )}

        {(pathname === "/" || pathname !== "/dashboard") && !isSearchOpen && (
          <Sheet>
            <SheetTrigger className="relative">
              <ShoppingBasket size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </SheetTrigger>
            <SheetContent className="w-full max-w-md sm:max-w-lg flex flex-col h-full p-0">
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
