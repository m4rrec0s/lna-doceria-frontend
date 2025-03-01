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

interface HeaderProps {
  showSearch?: boolean;
}

const Header = ({ showSearch = false }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(showSearch);
  const [searchTerm, setSearchTerm] = useState("");

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
          <span className="text-xl font-bold text-pink-300">LNA</span>
          <span className="text-sm font-bold">Confeitaria</span>
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

        {pathname === "/" && !isSearchOpen && (
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
        )}
      </div>
    </header>
  );
};

export default Header;
