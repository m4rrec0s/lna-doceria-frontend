"use client";

import ProductItem from "./productItem";
import { Product } from "../types/product";
import LoadingDots from "./LoadingDots";
import { motion } from "framer-motion";
import { containerAnimation, fadeInUp } from "../utils/animations";

interface ProductListProps {
  title?: string;
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  onPageChange?: (page: number) => void;
}

const ProductList = ({
  title = "Novos Doces",
  products,
  loading,
  error,
}: ProductListProps) => {
  if (!loading && !error && (!products || products.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <section className="flex justify-center items-center h-full">
        <LoadingDots title="Carregando delícias..." />
      </section>
    );
  }

  if (error) {
    return <section>{error}</section>;
  }

  return (
    <section className="w-full">
      <motion.h1
        className="text-3xl mb-6"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {(() => {
          const words = title.split(" ");
          if (words.length === 0) return title;
          const [firstWord, ...restWords] = words;
          return (
            <>
              <span className="font-bold">{firstWord}</span>
              {restWords.length > 0 && " " + restWords.join(" ")}
            </>
          );
        })()}
      </motion.h1>
      <motion.div
        className="overflow-x-auto pb-4"
        variants={containerAnimation}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {products.length > 0 ? (
          <ul className="flex items-center gap-6">
            {products.map((product: Product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </ul>
        ) : (
          <div className="w-full flex justify-center flex-grow p-6">
            <span className="text-zinc-400">Nenhum produto encontrado</span>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ProductList;
