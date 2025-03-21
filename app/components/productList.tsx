"use client";

import ProductItem from "./productItem";
import { Product } from "../types/product";
import LoadingDots from "./LoadingDots";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
  sectionId?: string;
}

const ProductList = ({
  title = "Novos Doces",
  products,
  loading,
  error,
  sectionId,
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
      <div className="flex items-center mb-6 justify-between px-8">
        <h1 className="text-2xl max-w-[50%]">
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
        </h1>
        {sectionId && (
          <Link
            href={`/colecao/${sectionId}`}
            className="text-sm text-primary flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div>
        {products.length > 0 ? (
          <ul className="flex items-center gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden px-8">
            {products.map((product: Product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </ul>
        ) : (
          <div className="w-full flex justify-center flex-grow p-6">
            <span className="text-zinc-400">Nenhum produto encontrado</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
