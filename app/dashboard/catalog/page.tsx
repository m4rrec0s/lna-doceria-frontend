'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/app/hooks/useApi';
import { Category } from '@/app/types/category';
import { Flavor } from '@/app/types/flavor';
import CategoryForm from '@/app/components/dashboard/CategoryForm';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function CatalogPage() {
  const {
    categories,
    loading,
    getCategories,
    createFlavor,
    updateFlavor,
    deleteFlavor,
    deleteCategory,
  } = useApi();

  const [newFlavorNames, setNewFlavorNames] = useState<Record<string, string>>({});
  const [editingFlavorId, setEditingFlavorId] = useState<string | null>(null);
  const [editingFlavorName, setEditingFlavorName] = useState('');

  useEffect(() => {
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddFlavor = async (categoryId: string) => {
    const name = newFlavorNames[categoryId]?.trim();
    if (!name) {
      toast.error('Digite um nome para o sabor');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('categoryId', categoryId);

    try {
      await createFlavor(formData);
      setNewFlavorNames((prev) => ({ ...prev, [categoryId]: '' }));
      await getCategories(true);
      toast.success('Sabor adicionado');
    } catch {
      toast.error('Erro ao adicionar sabor');
    }
  };

  const handleSaveFlavor = async (flavor: Flavor) => {
    const value = editingFlavorName.trim();
    if (!value) return;
    try {
      const formData = new FormData();
      formData.append('name', value);
      if (flavor.categoryId) formData.append('categoryId', flavor.categoryId);
      await updateFlavor(flavor.id, formData);
      setEditingFlavorId(null);
      setEditingFlavorName('');
      await getCategories(true);
      toast.success('Sabor atualizado');
    } catch {
      toast.error('Erro ao atualizar sabor');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`Excluir categoria ${category.name}?`)) return;
    try {
      await deleteCategory(category.id);
      await getCategories(true);
      toast.success('Categoria removida');
    } catch {
      toast.error('Erro ao remover categoria');
    }
  };

  const handleDeleteFlavor = async (flavorId: string) => {
    if (!window.confirm('Excluir este sabor?')) return;
    try {
      await deleteFlavor(flavorId);
      await getCategories(true);
      toast.success('Sabor removido');
    } catch {
      toast.error('Erro ao remover sabor');
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-zinc-900">Catálogo</h1>
        <p className="mt-1 text-sm text-zinc-600">Organize categorias e sabores no mesmo fluxo.</p>
      </section>

      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Nova Categoria</h2>
        <CategoryForm onSubmitSuccess={() => getCategories(true)} />
      </section>

      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Categorias com Sabores</h2>

        <div className="space-y-4">
          {categories.map((category) => (
            <article key={category.id} className="rounded-xl border border-zinc-200 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-zinc-900">{category.name}</h3>
                  <p className="text-xs text-zinc-500">
                    Tipo: {category.sellingType === 'package' ? 'Pacote' : 'Unidade'}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteCategory(category)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Excluir categoria
                </Button>
              </div>

              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Novo sabor para esta categoria"
                  value={newFlavorNames[category.id] || ''}
                  onChange={(e) =>
                    setNewFlavorNames((prev) => ({ ...prev, [category.id]: e.target.value }))
                  }
                />
                <Button className="bg-rose-300 text-rose-950 hover:bg-rose-400" onClick={() => handleAddFlavor(category.id)}>
                  <Plus className="mr-1 h-4 w-4" /> Adicionar sabor
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {(category.flavors || []).map((flavor) => (
                  <div key={flavor.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 p-2">
                    {editingFlavorId === flavor.id ? (
                      <div className="flex w-full items-center gap-2">
                        <Input value={editingFlavorName} onChange={(e) => setEditingFlavorName(e.target.value)} />
                        <Button size="sm" onClick={() => handleSaveFlavor(flavor)}>Salvar</Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-rose-200 bg-rose-50">
                            {flavor.imageUrl ? (
                              <Image src={flavor.imageUrl} alt={flavor.name} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                                {flavor.name.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-zinc-700">{flavor.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingFlavorId(flavor.id); setEditingFlavorName(flavor.name); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteFlavor(flavor.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {(category.flavors || []).length === 0 && (
                  <p className="text-sm text-zinc-500">Sem sabores vinculados.</p>
                )}
              </div>
            </article>
          ))}
          {!loading && categories.length === 0 && <p className="text-sm text-zinc-500">Nenhuma categoria cadastrada.</p>}
        </div>
      </section>
    </div>
  );
}
