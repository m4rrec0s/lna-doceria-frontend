"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryForm from "@/app/components/dashboard/CategoryForm";
import { useApi } from "@/app/hooks/useApi";

export default function CatalogFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");
  const { categories, getCategories, loading } = useApi();

  useEffect(() => {
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const category = useMemo(
    () => (categories || []).find((item) => item.id === categoryId),
    [categories, categoryId]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-2xl font-semibold text-zinc-900">
        {categoryId ? "Editar categoria" : "Nova categoria"}
      </h1>
      <div className="rounded-2xl border border-rose-100 bg-white p-4">
        {categoryId && loading && !category ? (
          <div className="text-sm text-zinc-600">Carregando dados da categoria...</div>
        ) : (
          <CategoryForm
            category={category}
            onSubmitSuccess={() => router.back()}
            onCancel={() => router.back()}
          />
        )}
      </div>
    </div>
  );
}
