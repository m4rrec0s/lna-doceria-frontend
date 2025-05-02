"use client";

import ProductItem from "./productItem";
import { Product } from "../types/product";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Category } from "../types/category";

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
  category: Category | null;
}

const ProductList = ({
  title = "Novos Doces",
  products,
  loading,
  error,
  sectionId,
  category,
}: ProductListProps) => {
  if (loading) {
    return (
      <section className="flex justify-center items-center h-full">
        <ItemsListSkeleton />
      </section>
    );
  }

  if (error) {
    return <section>{error}</section>;
  }

  return (
    <section className="w-full">
      <div className="flex items-center mb-6 justify-between">
        <h1 className="text-2xl max-w-[50%] px-2">
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
          {category && category.sellingType === "package" && (
            <span className="inline-flex items-center sm:ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Pacote com {category.packageSizes} unidades
            </span>
          )}
        </h1>
        {sectionId && (
          <Link
            href={`/collection/${sectionId}`}
            className="text-sm text-primary flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div>
        {products && products.length > 0 ? (
          <ul className="flex items-center gap-6 px-2 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {products.map((product: Product) => (
              <ProductItem
                key={`${sectionId}-${product.id}`}
                product={product}
              />
            ))}
          </ul>
        ) : (
          <div className="w-full flex justify-center flex-grow p-6">
            <span className="text-zinc-400">
              Nenhum produto encontrado nesta seção
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export function ItemsListSkeleton() {
  return (
    <div className="flex items-center gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden px-8">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl min-w-[250px] h-[420px] shadow-lg flex flex-col"
        >
          <Skeleton className="w-full h-[200px] rounded-t-2xl" />
          <div className="p-4 flex flex-col flex-grow gap-4">
            <Skeleton className="h-6 w-4/5 mx-auto" />

            <div className="flex justify-center gap-1 flex-wrap">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>

            <div className="mt-auto">
              <Skeleton className="h-9 w-full rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
