"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApi } from "../hooks/useApi";
import { Product } from "../types/product";
import Header from "../components/header";
import ProductGrid from "../components/productGrid";
import { LoadingDots } from "../components/LoadingDots";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { getProductBySearch } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true);
      const query = searchParams.get("q");

      if (!query || query.trim() === "") {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const products = await getProductBySearch(query);
        setProducts(Array.isArray(products) ? products : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    searchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const query = searchParams.get("q");

  return (
    <div className="container mx-auto py-4 px-8">
      <div className="w-full">
        {loading ? (
          <LoadingDots text="Carregando produtos..." />
        ) : (
          <div className="my-6 flex flex-col justify-center items-center gap-3">
            <h2 className="text-2xl">
              <strong>Resultados</strong> para &quot;{query}&quot;
            </h2>
            <ProductGrid products={products} />
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="flex justify-center items-center h-[200px]">
            <p className="text-lg">
              Nenhum produto encontrado para &quot;{query}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <Header showSearch />
      </Suspense>
      <Suspense
        fallback={
          <div className="container mx-auto py-4 px-8">
            <LoadingDots text="Carregando produtos..." />
          </div>
        }
      >
        <SearchPageContent />
      </Suspense>
    </main>
  );
}
