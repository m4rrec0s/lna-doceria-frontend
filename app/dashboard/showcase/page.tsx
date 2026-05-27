"use client";

import { useEffect } from "react";
import ProductDisplaySettings from "@/app/components/dashboard/ProductDisplaySettings";
import { useApi } from "@/app/hooks/useApi";

export default function ShowcasePage() {
  const { categories, products, getCategories, getAllProducts } = useApi();

  useEffect(() => {
    getCategories();
    getAllProducts({ page: 1, per_page: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-2 sm:px-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Vitrine</h1>
      <p className="mt-1 text-xs sm:text-sm text-zinc-600">
        Ajuste seções exibidas na Home e a ordem do feed de produtos.
      </p>

      <section className="p-0 sm:p-6">
        <ProductDisplaySettings categories={categories} products={products} />
      </section>
    </div>
  );
}
