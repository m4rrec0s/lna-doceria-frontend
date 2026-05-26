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
    <section className="w-full sm:rounded-lg sm:border border-rose-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="max-w-[70%] text-xl text-zinc-900 md:text-2xl">
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
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 sm:ml-2">
              Pacote com {category.packageSizes} unidades
            </span>
          )}
        </h1>
        {sectionId && products.length > 6 && (
          <Link
            href={`/collection/${sectionId}`}
            className="flex items-center gap-1 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
          >
            <span>Ver todos</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div>
        {products && products.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
            {products.slice(0, 6).map((product: Product) => (
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
    <div className="grid grid-cols-2 gap-4 px-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="flex h-[420px] min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
        >
          <Skeleton className="h-[210px] w-full" />
          <div className="flex flex-grow flex-col gap-4 p-4">
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
