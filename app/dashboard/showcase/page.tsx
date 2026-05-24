'use client';

import { useEffect } from 'react';
import ProductDisplaySettings from '@/app/components/dashboard/ProductDisplaySettings';
import { useApi } from '@/app/hooks/useApi';

export default function ShowcasePage() {
  const { categories, products, getCategories, getAllProducts } = useApi();

  useEffect(() => {
    getCategories();
    getAllProducts({ page: 1, per_page: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-zinc-900">Vitrine e Feed</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Ajuste seções exibidas na Home e a ordem do feed de produtos.
        </p>
      </section>

      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
        <ProductDisplaySettings categories={categories} products={products} />
      </section>
    </div>
  );
}
