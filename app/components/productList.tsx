"use client";

import ProductItem from "./productItem";
import { Product } from "../types/product";
import LoadingDots from "./LoadingDots";
import { motion } from "framer-motion";
import { containerAnimation, fadeInUp } from "../utils/animations";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  pagination,
  onPageChange,
}: ProductListProps) => {
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
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: Product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </ul>

            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    onPageChange && onPageChange(pagination.page - 1)
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(pagination.total_pages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={
                        pagination.page === i + 1 ? "default" : "outline"
                      }
                      className="h-8 w-8 p-0"
                      onClick={() => onPageChange && onPageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.total_pages}
                  onClick={() =>
                    onPageChange && onPageChange(pagination.page + 1)
                  }
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
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
