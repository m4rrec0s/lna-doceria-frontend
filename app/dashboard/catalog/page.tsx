"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApi } from "@/app/hooks/useApi";
import { Category } from "@/app/types/category";
import { Button } from "@/app/components/ui/button";

export default function CatalogPage() {
  const router = useRouter();
  const { categories, loading, getCategories, deleteCategory } = useApi();

  useEffect(() => {
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`Excluir categoria ${category.name}?`)) return;
    try {
      await deleteCategory(category.id);
      await getCategories(true);
      toast.success("Categoria removida");
    } catch {
      toast.error("Erro ao remover categoria");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Categorias</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Gestão com formulário dedicado para criação e edição.
            </p>
          </div>
          <Button
            className="bg-rose-300 text-rose-950 hover:bg-rose-400"
            onClick={() => router.push("/dashboard/catalog/form")}
          >
            <Plus className="mr-1 h-4 w-4" /> Nova categoria
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        {(categories || []).map((category) => (
          <article
            key={category.id}
            className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">{category.name}</h2>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/catalog/form?id=${category.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(category.flavors || []).map((flavor) => (
                <div
                  key={flavor.id}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-800"
                >
                  <div className="relative h-5 w-5 overflow-hidden rounded-full bg-white">
                    {flavor.imageUrl ? (
                      <Image src={flavor.imageUrl} alt={flavor.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px]">
                        {flavor.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {flavor.name}
                </div>
              ))}
              {(category.flavors || []).length === 0 && (
                <span className="text-xs text-zinc-500">Sem sabores vinculados</span>
              )}
            </div>
          </article>
        ))}

        {!loading && (categories || []).length === 0 && (
          <div className="rounded-2xl border border-rose-100 bg-white p-6 text-center text-zinc-500">
            Nenhuma categoria cadastrada.
          </div>
        )}
      </section>
    </div>
  );
}
