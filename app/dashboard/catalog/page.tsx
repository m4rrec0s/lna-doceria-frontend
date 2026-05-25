'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/app/hooks/useApi';
import { Category } from '@/app/types/category';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';

type LocalFlavor = {
  id?: string;
  name: string;
  imageUrl?: string;
  imageFile?: File | null;
  status?: 'new' | 'edited' | 'deleted' | 'clean';
};

export default function CatalogPage() {
  const {
    categories,
    loading,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createFlavor,
    updateFlavor,
    deleteFlavor,
  } = useApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [sellingType, setSellingType] = useState<'package' | 'unit'>('unit');
  const [packageSizesText, setPackageSizesText] = useState('');
  const [flavors, setFlavors] = useState<LocalFlavor[]>([]);
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newFlavorImage, setNewFlavorImage] = useState<File | null>(null);

  useEffect(() => {
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSellingType('unit');
    setPackageSizesText('');
    setFlavors([]);
    setNewFlavorName('');
    setNewFlavorImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSellingType((category.sellingType as 'package' | 'unit') || 'unit');
    setPackageSizesText((category.packageSizes || []).join(', '));
    setFlavors(
      (category.flavors || []).map((flavor) => ({
        id: flavor.id,
        name: flavor.name,
        imageUrl: flavor.imageUrl,
        imageFile: null,
        status: 'clean',
      })),
    );
    setNewFlavorName('');
    setNewFlavorImage(null);
    setIsModalOpen(true);
  };

  const packageSizes = useMemo(() => {
    if (sellingType !== 'package') return null;
    return packageSizesText
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => !Number.isNaN(item) && item > 0);
  }, [packageSizesText, sellingType]);

  const addFlavorToDraft = () => {
    const value = newFlavorName.trim();
    if (!value) return;
    if (!newFlavorImage) {
      toast.error('Envie a imagem do sabor antes de adicionar.');
      return;
    }
    setFlavors((prev) => [
      ...prev,
      { name: value, imageFile: newFlavorImage, status: 'new' },
    ]);
    setNewFlavorName('');
    setNewFlavorImage(null);
  };

  const updateDraftFlavor = (index: number, value: string) => {
    setFlavors((prev) =>
      prev.map((flavor, i) =>
        i === index
          ? {
              ...flavor,
              name: value,
              status: flavor.status === 'new' ? 'new' : 'edited',
            }
          : flavor,
      ),
    );
  };

  const removeDraftFlavor = (index: number) => {
    setFlavors((prev) => {
      const target = prev[index];
      if (!target?.id) return prev.filter((_, i) => i !== index);
      return prev.map((flavor, i) => (i === index ? { ...flavor, status: 'deleted' } : flavor));
    });
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

  const handleSaveCategory = async () => {
    if (!name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        sellingType,
        packageSizes: sellingType === 'package' ? packageSizes : null,
      };

      let categoryId = editingCategory?.id;

      if (categoryId) {
        await updateCategory(categoryId, payload);
      } else {
        const created = await createCategory(payload as Omit<Category, 'id'>);
        categoryId = created.id;
      }

      if (categoryId) {
        const tasks = flavors
          .filter((flavor) => flavor.status !== 'clean')
          .map(async (flavor) => {
            if (flavor.status === 'deleted' && flavor.id) {
              await deleteFlavor(flavor.id);
              return;
            }

            if (flavor.status === 'new') {
              const formData = new FormData();
              formData.append('name', flavor.name.trim());
              formData.append('categoryId', categoryId);
              if (flavor.imageFile) {
                formData.append('image', flavor.imageFile);
              }
              await createFlavor(formData);
              return;
            }

            if (flavor.status === 'edited' && flavor.id) {
              const formData = new FormData();
              formData.append('name', flavor.name.trim());
              formData.append('categoryId', categoryId);
              await updateFlavor(flavor.id, formData);
            }
          });

        await Promise.all(tasks);
      }

      await getCategories(true);
      setIsModalOpen(false);
      toast.success(editingCategory ? 'Categoria atualizada' : 'Categoria criada');
    } catch {
      toast.error('Não foi possível salvar a categoria');
    }
  };

  const visibleFlavors = (category: Category) => category.flavors || [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Categorias e Sabores</h1>
            <p className="mt-1 text-sm text-zinc-600">Gestao centralizada com edicao em modal por categoria.</p>
          </div>
          <Button className="bg-rose-300 text-rose-950 hover:bg-rose-400" onClick={openCreateModal}>
            <Plus className="mr-1 h-4 w-4" /> Nova categoria
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="w-[120px]">Tipo</TableHead>
              <TableHead className="min-w-[280px]">Sabores</TableHead>
              <TableHead className="w-[140px] text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium text-zinc-900">{category.name}</TableCell>
                <TableCell>{category.sellingType === 'package' ? 'Pacote' : 'Unidade'}</TableCell>
                <TableCell>
                  <div className="max-w-[440px] overflow-x-auto whitespace-nowrap pb-1">
                    <div className="inline-flex gap-2">
                      {visibleFlavors(category).map((flavor) => (
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
                      {visibleFlavors(category).length === 0 && (
                        <span className="text-xs text-zinc-500">Sem sabores vinculados</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(category)}>
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
                </TableCell>
              </TableRow>
            ))}
            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-500">
                  Nenhuma categoria cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block">Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Tipo de venda</Label>
                <select
                  value={sellingType}
                  onChange={(e) => setSellingType(e.target.value as 'package' | 'unit')}
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3"
                >
                  <option value="unit">Unidade</option>
                  <option value="package">Pacote</option>
                </select>
              </div>
            </div>

            {sellingType === 'package' && (
              <div>
                <Label className="mb-1 block">Tamanhos de pacote (separados por virgula)</Label>
                <Input
                  value={packageSizesText}
                  onChange={(e) => setPackageSizesText(e.target.value)}
                  placeholder="Ex.: 6, 12, 24"
                />
              </div>
            )}

            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
              <h3 className="mb-3 text-sm font-semibold text-rose-900">Sabores da categoria</h3>
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Adicionar novo sabor"
                  value={newFlavorName}
                  onChange={(e) => setNewFlavorName(e.target.value)}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewFlavorImage(e.target.files?.[0] || null)}
                />
                <Button onClick={addFlavorToDraft} className="bg-rose-300 text-rose-950 hover:bg-rose-400">
                  <Plus className="mr-1 h-4 w-4" /> Adicionar
                </Button>
              </div>

              <div className="space-y-2">
                {flavors.filter((flavor) => flavor.status !== 'deleted').map((flavor, index) => (
                  <div key={`${flavor.id || 'new'}-${index}`} className="flex items-center gap-2">
                    <Input
                      value={flavor.name}
                      onChange={(e) => updateDraftFlavor(index, e.target.value)}
                    />
                    <Button variant="outline" size="icon" onClick={() => removeDraftFlavor(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {flavors.filter((flavor) => flavor.status !== 'deleted').length === 0 && (
                  <p className="text-sm text-zinc-500">Nenhum sabor na categoria.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} className="bg-zinc-900 text-white hover:bg-zinc-700">
              Salvar categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
