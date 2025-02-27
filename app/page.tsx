"use client";

import "./globals.css";
import Banner from "./components/banner";
import Header from "./components/header";
import { useEffect, useState } from "react";
import { Product } from "./types/product";
import { useApi } from "./hooks/useApi";
import { motion } from "framer-motion";
import { fadeInUp } from "./utils/animations";
import ProductList from "./components/productList";
import { Category } from "./types/category";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Search } from "lucide-react";

export default function Home() {
  const { getProducts, getCategories, pagination } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          per_page: 50,
          name: searchTerm || undefined,
          categoryId:
            selectedCategory && selectedCategory !== "all"
              ? selectedCategory
              : undefined,
        };

        const productsData = await getProducts(params);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setError(error as string);
        setLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset para a primeira página ao fazer uma nova busca
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <main className="w-full overflow-x-hidden">
      <Header />
      <section className="mt-[100px]">
        <div className="px-4 md:px-8">
          <motion.div
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.3,
                },
              },
            }}
          >
            <motion.h1
              className="text-3xl md:text-4xl font-light mb-2"
              variants={fadeInUp}
            >
              Experimente e Aprecie
            </motion.h1>
            <motion.h2
              className="text-3xl md:text-4xl font-bold flex items-center gap-2"
              variants={fadeInUp}
            >
              Doces de Qualidade{" "}
              <motion.span
                role="img"
                aria-label="cake"
                initial={{ rotate: -10 }}
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{
                  duration: 1.5,
                  delay: 1,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
              >
                🍰
              </motion.span>
            </motion.h2>
          </motion.div>
          <motion.div>
            <Banner
              imageUrl="/bannerImage.png"
              title="Confira Aqui"
              description="Brigadeiros"
              route="#"
            />
          </motion.div>
        </div>
      </section>
      <div className="px-4 md:px-8 mt-6">
        <div className="bg-white/10 p-4 rounded-lg mb-6 backdrop-blur-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="shrink-0">
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </form>
        </div>
        <div className="py-6">
          <ProductList
            products={products}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </main>
  );
}
