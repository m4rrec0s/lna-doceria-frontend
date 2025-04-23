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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCart } from "../context/CartContext";
import CartItem from "./cart/CartItem";
import CartSummary from "./cart/CartSummary";
import { cn } from "../lib/utils";
import { useApi } from "../hooks/useApi";
import { Category } from "../types/category";

interface HeaderProps {
  showSearch?: boolean;
}

const Header = ({ showSearch = false }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { getCategories } = useApi();
  const [isSearchOpen, setIsSearchOpen] = useState(showSearch);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const { items, isCartOpen, setIsCartOpen } = useCart();
  const itemCount = items.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response);
        console.log("Categories fetched:", response);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Title */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {categories &&
            categories.map((category) => (
              <Link
                key={category.id}
                href={category.id ? `/colecao/${category.id}` : "#"}
                className="text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors"
              >
                {category.name}
              </Link>
            ))}
        </nav>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch}>
          <div className="hidden md:flex items-center relative max-w-xs w-full mx-4">
            <Input
              type="search"
              placeholder="Buscar doces..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 border-pink-200 focus-visible:ring-pink-500"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            type="submit"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Buscar</span>
          </Button>
        </form>

        {/* Actions */}
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

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-gray-700" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4 border-b">
                    <span className="text-lg font-medium">Menu</span>
                  </div>
                  <nav className="flex flex-col space-y-4 py-6">
                    {categories &&
                      categories.map((category) => (
                        <Link
                          key={category.id}
                          href={category.id ? `/colecao/${category.id}` : "#"}
                          className="text-base font-medium text-gray-700 hover:text-pink-500 transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>

      {/* Mobile Search Bar - Expandable */}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 border-pink-200 focus-visible:ring-pink-500"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </form>
      </div>

      {/* Cart Modal */}
      {/* <CartModal open={isCartOpen} onOpenChange={setIsCartOpen} /> */}

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
