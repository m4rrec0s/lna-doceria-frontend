"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "../../../hooks/useApi";
import { Product } from "../../../types/product";
import { Category } from "../../../types/category";
import { motion } from "framer-motion";
import { fadeInUp } from "../../../utils/animations";
import ProductItem from "@/app/components/productItem";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";

interface CategoryClientProps {
  categoryId: string;
}

export default function CategoryClient({ categoryId }: CategoryClientProps) {
  const { getProductsByCategoryId, getCategories } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;

      setLoading(true);
      setError(null);

      try {
        const categories = await getCategories();
        const foundCategory = categories.find(
          (cat: Category) => cat.id === categoryId
        );

        if (foundCategory) {
          setCategory(foundCategory);
        }
        const response = await getProductsByCategoryId(categoryId);
        if (response && response.data) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Erro ao buscar dados da categoria:", err);
        setError("Não foi possível carregar os produtos desta categoria.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  return (
    <main className="w-screen min-h-screen flex flex-col justify-center items-center">
      <Header />
      <div className="w-full">
        <div className="container mx-auto px-8 py-4">
          <Button onClick={() => router.back()} variant={"link"}>
            <ChevronLeft size={24} /> <span>Voltar</span>
          </Button>
        </div>
      </div>
      <section className="px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.3 },
            },
          }}
          className="mb-8"
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-2"
            variants={fadeInUp}
          >
            {category?.name || "Categoria"}
          </motion.h1>
        </motion.div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="flex justify-center w-full px-4 sm:px-6 md:px-8">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 w-full max-w-screen-xl mx-auto">
              {loading ? (
                <li className="text-center col-span-full">
                  Carregando produtos...
                </li>
              ) : (
                products.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))
              )}
            </ul>
          </div>
        )}

        {!loading && products.length === 0 && !error && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-medium mb-4">
              Nenhum produto encontrado
            </h2>
            <p className="text-gray-600">
              Não encontramos produtos nesta categoria no momento.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
