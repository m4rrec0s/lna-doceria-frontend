"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useApi } from "../hooks/useApi";
import Header from "../components/header";
import ProductForm from "../components/dashboard/ProductForm";
import CategoryForm from "../components/dashboard/CategoryForm";
import ProductList from "../components/dashboard/ProductList";
import { Product } from "../types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { EditProductDialog } from "../components/dashboard/EditProductDialog";
import { Button } from "../components/ui/button";
import { Category } from "../types/category";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import ProductDisplaySettings from "../components/dashboard/ProductDisplaySettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Flavor } from "../types/flavor";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const DashBoard = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const {
    products,
    categories,
    pagination,
    loading,
    error,
    getAllProducts,
    getCategories,
    getFlavors,
    createFlavor,
    updateFlavor,
    updateCategory,
    deleteProduct,
    deleteCategory,
    deleteFlavor,
    updateProduct,
  } = useApi();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState("all");
  const [newFlavorNames, setNewFlavorNames] = useState<Record<string, string>>({});
  const [editingFlavorId, setEditingFlavorId] = useState<string | null>(null);
  const [editingFlavorName, setEditingFlavorName] = useState("");

  const [categoryData, setCategoryData] = useState({
    name: "",
    sellingType: "package" as "package" | "unit",
    packageSize: "",
    packageSizes: [] as number[],
  });

  useEffect(() => {
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = {
      page: currentPage,
      name: searchTerm || undefined,
      categoryId:
        filterCategory && filterCategory !== "all" ? filterCategory : undefined,
    };

    getAllProducts(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filterCategory]);

  useEffect(() => {
    getFlavors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setCategoryData({
        name: selectedCategory.name,
        sellingType: selectedCategory.sellingType || "package",
        packageSize: "",
        packageSizes: selectedCategory.packageSizes || [],
      });
    }
  }, [selectedCategory]);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleStartEditFlavor = (flavor: Flavor) => {
    setEditingFlavorId(flavor.id);
    setEditingFlavorName(flavor.name);
  };

  const handleSaveFlavor = async (flavor: Flavor) => {
    try {
      if (!editingFlavorName.trim()) return;
      const formData = new FormData();
      formData.append("name", editingFlavorName.trim());
      if (flavor.categoryId) formData.append("categoryId", flavor.categoryId);
      await updateFlavor(flavor.id, formData);
      setEditingFlavorId(null);
      setEditingFlavorName("");
      await getCategories(true);
      await getFlavors();
      toast.success("Sabor atualizado");
    } catch {
      toast.error("Não foi possível atualizar o sabor");
    }
  };

  const handleAddFlavorToCategory = async (categoryId: string) => {
    const value = newFlavorNames[categoryId]?.trim();
    if (!value) return;
    try {
      const formData = new FormData();
      formData.append("name", value);
      formData.append("categoryId", categoryId);
      await createFlavor(formData);
      setNewFlavorNames((prev) => ({ ...prev, [categoryId]: "" }));
      await getCategories(true);
      await getFlavors();
      toast.success("Sabor adicionado");
    } catch {
      toast.error("Não foi possível adicionar o sabor");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory && categoryData.name.trim()) {
      await updateCategory(selectedCategory.id, {
        name: categoryData.name.trim(),
        sellingType: categoryData.sellingType,
        packageSizes:
          categoryData.sellingType === "package"
            ? categoryData.packageSizes
            : null,
      });
      setIsCategoryDialogOpen(false);
      getCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      await deleteCategory(id);
      getCategories();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteProduct(id);
    }
  };

  const handleDeleteFlavor = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este sabor?")) {
      await deleteFlavor(id);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);

    const params = {
      page: 1,
      name: searchTerm || undefined,
      categoryId:
        filterCategory && filterCategory !== "all" ? filterCategory : undefined,
    };

    getAllProducts(params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSellingTypeChange = (value: "package" | "unit") => {
    setCategoryData((prev) => ({ ...prev, sellingType: value }));
  };

  const addPackageSize = () => {
    const size = parseInt(categoryData.packageSize);
    if (isNaN(size) || size <= 0) return;

    if (!categoryData.packageSizes.includes(size)) {
      setCategoryData((prev) => ({
        ...prev,
        packageSizes: [...prev.packageSizes, size].sort((a, b) => a - b),
        packageSize: "",
      }));
    } else {
      setCategoryData((prev) => ({ ...prev, packageSize: "" }));
    }
  };

  const removePackageSize = (size: number) => {
    setCategoryData((prev) => ({
      ...prev,
      packageSizes: prev.packageSizes.filter((s) => s !== size),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPackageSize();
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const newActiveState = !product.active;

      await updateProduct(product.id, {
        active: newActiveState,
      });

      toast.success(
        `Produto ${newActiveState ? "ativado" : "desativado"} com sucesso!`
      );

      getAllProducts({
        page: currentPage,
        name: searchTerm || undefined,
        categoryId:
          filterCategory && filterCategory !== "all"
            ? filterCategory
            : undefined,
      });
    } catch (error) {
      console.error("Erro ao alternar estado do produto:", error);
      toast.error("Erro ao alterar o status do produto");
    }
  };

  if (!user) {
    return <div>Você precisa estar logado para acessar esta página.</div>;
  }

  const activeSection = pathname.includes("/catalog")
    ? "catalog"
    : pathname.includes("/showcase")
      ? "settings"
      : "products";

  const handleSectionChange = (section: string) => {
    if (section === "catalog") {
      router.push("/dashboard/catalog");
      return;
    }
    if (section === "settings") {
      router.push("/dashboard/showcase");
      return;
    }
    router.push("/dashboard/products");
  };

  return (
    <main className="min-h-screen pb-10">
      <Header />
      <div className="container mx-auto px-4 mt-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard de Administração</h1>
        <p className="mb-8">Bem-vindo, {user?.name}!</p>

        <Tabs
          value={activeSection}
          onValueChange={handleSectionChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-xl grid-cols-3 rounded-xl bg-rose-50 p-1">
            <TabsTrigger value="products" className="rounded-lg">Produtos</TabsTrigger>
            <TabsTrigger value="catalog" className="rounded-lg">Catálogo</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Vitrine</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Adicionar Novo Produto</h2>
              <ProductForm
                categories={categories}
                onSubmitSuccess={() => getAllProducts({ page: 1 })}
              />
            </div>

            <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Produtos Cadastrados</h2>

              <form
                onSubmit={handleSearch}
                className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]"
              >
                <Input
                  type="text"
                  placeholder="Buscar produtos por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">Buscar</Button>
              </form>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <ProductList
                  products={products}
                  loading={loading}
                  error={error}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleActive={handleToggleActive}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </div>

            <EditProductDialog
              product={selectedProduct}
              categories={categories}
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onSuccess={() => getAllProducts({ page: currentPage })}
            />
          </TabsContent>

          <TabsContent value="catalog" className="space-y-8">
            <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Criar Categoria</h2>
              <CategoryForm onSubmitSuccess={getCategories} />
            </div>

            <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Categorias e Sabores</h2>
                <Select
                  value={catalogCategoryFilter}
                  onValueChange={setCatalogCategoryFilter}
                >
                  <SelectTrigger className="w-full md:w-72">
                    <SelectValue placeholder="Filtrar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {categories
                  .filter((category) =>
                    catalogCategoryFilter === "all"
                      ? true
                      : category.id === catalogCategoryFilter
                  )
                  .map((category) => (
                    <div
                      key={category.id}
                      className="rounded-xl border border-zinc-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-zinc-900">{category.name}</h3>
                          <p className="text-xs text-zinc-500">
                            Venda: {category.sellingType === "package" ? "Pacote" : "Unidade"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            Editar categoria
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                        <Input
                          placeholder="Novo sabor para esta categoria"
                          value={newFlavorNames[category.id] || ""}
                          onChange={(e) =>
                            setNewFlavorNames((prev) => ({
                              ...prev,
                              [category.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddFlavorToCategory(category.id)}
                          className="bg-rose-300 text-rose-950 hover:bg-rose-400"
                        >
                          <Plus size={14} className="mr-1" /> Adicionar sabor
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {(category.flavors || []).map((flavor) => (
                          <div
                            key={flavor.id}
                            className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2"
                          >
                            {editingFlavorId === flavor.id ? (
                              <div className="flex w-full items-center gap-2">
                                <Input
                                  value={editingFlavorName}
                                  onChange={(e) => setEditingFlavorName(e.target.value)}
                                  className="h-8"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleSaveFlavor(flavor)}
                                >
                                  Salvar
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <div className="relative h-7 w-7 overflow-hidden rounded-full border border-rose-200 bg-rose-50">
                                    {flavor.imageUrl ? (
                                      <Image
                                        src={flavor.imageUrl}
                                        alt={flavor.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                                        {flavor.name.slice(0, 1).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-sm text-zinc-700">{flavor.name}</span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleStartEditFlavor(flavor)}
                                  >
                                    <Pencil size={14} />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500"
                                    onClick={() => handleDeleteFlavor(flavor.id)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        {(category.flavors || []).length === 0 && (
                          <p className="text-sm text-zinc-500">Sem sabores nesta categoria.</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Configurar Vitrine</h2>
              <ProductDisplaySettings
                key="display-settings"
                categories={categories}
                products={products}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Nome da Categoria *</Label>
              <Input
                id="categoryName"
                value={categoryData.name}
                onChange={(e) =>
                  setCategoryData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nome da categoria"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="block text-sm font-medium">
                Tipo de Venda *
              </Label>
              <RadioGroup
                value={categoryData.sellingType}
                onValueChange={(value: string) =>
                  handleSellingTypeChange(value as "package" | "unit")
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="package" id="selling-package" />
                  <Label htmlFor="selling-package">Pacote</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unit" id="selling-unit" />
                  <Label htmlFor="selling-unit">Unidade</Label>
                </div>
              </RadioGroup>
            </div>

            {categoryData.sellingType === "package" && (
              <div className="space-y-2">
                <Label
                  htmlFor="packageSize"
                  className="block text-sm font-medium"
                >
                  Tamanhos de Pacote
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    id="packageSize"
                    value={categoryData.packageSize}
                    onChange={(e) =>
                      setCategoryData((prev) => ({
                        ...prev,
                        packageSize: e.target.value,
                      }))
                    }
                    placeholder="Quantidade por pacote"
                    className="flex-grow"
                    min="1"
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    type="button"
                    onClick={addPackageSize}
                    variant="secondary"
                  >
                    Adicionar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryData.packageSizes.map((size) => (
                    <Badge
                      key={size}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {size} unidades
                      <button
                        title="close"
                        type="button"
                        onClick={() => removePackageSize(size)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory?.flavors &&
              selectedCategory.flavors.length > 0 && (
                <div className="space-y-2">
                  <Label className="block text-sm font-medium">
                    Sabores associados a esta categoria
                  </Label>
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCategory.flavors.map((flavor) => (
                        <div
                          key={flavor.id}
                          className="text-sm p-1 bg-gray-100 dark:bg-zinc-800 rounded"
                        >
                          {flavor.name}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Para gerenciar sabores, acesse a aba Sabores no dashboard.
                    </p>
                  </div>
                </div>
              )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

const ProductSkeleton = () => {
  return (
    <Skeleton className="h-16 w-full mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    </Skeleton>
  );
};

export default DashBoard;
