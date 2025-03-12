"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useApi } from "../hooks/useApi";
import Header from "../components/header";
import ProductForm from "../components/dashboard/ProductForm";
import CategoryForm from "../components/dashboard/CategoryForm";
import ProductList from "../components/dashboard/ProductList";
import { Product } from "../types/product";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
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
import { Trash2, X } from "lucide-react";
import ProductDisplaySettings from "../components/dashboard/ProductDisplaySettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import FlavorForm from "../components/dashboard/FlavorForm";
import FlavorList from "../components/dashboard/FlavorList";
import { EditFlavorDialog } from "../components/dashboard/EditFlavorDialog";
import { Flavor } from "../types/flavor";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Badge } from "../components/ui/badge";

const DashBoard = () => {
  const { user } = useAuth();
  const {
    products,
    categories,
    flavors,
    pagination,
    loading,
    error,
    getProducts,
    getCategories,
    getFlavors,
    updateCategory,
    deleteProduct,
    deleteCategory,
    deleteFlavor,
  } = useApi();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isFlavorDialogOpen, setIsFlavorDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [flavorCategoryFilter, setFlavorCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

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

    getProducts(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filterCategory]);

  useEffect(() => {
    getFlavors({
      categoryId:
        flavorCategoryFilter !== "all" ? flavorCategoryFilter : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flavorCategoryFilter]);

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

  const handleEditFlavor = (flavor: Flavor) => {
    setSelectedFlavor(flavor);
    setIsFlavorDialogOpen(true);
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

    getProducts(params);
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

  if (!user) {
    return <div>Você precisa estar logado para acessar esta página.</div>;
  }

  return (
    <main className="min-h-screen pb-10">
      <Header />
      <div className="container mx-auto px-4 pt-[120px]">
        <h1 className="text-3xl font-bold mb-6">Dashboard de Administração</h1>
        <p className="mb-8">Bem-vindo, {user?.name}!</p>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid grid-cols-4 max-w-md mb-6">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="flavors">Sabores</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Adicionar Novo Produto
              </h2>
              <ProductForm
                categories={categories}
                onSubmitSuccess={() => getProducts({ page: 1 })}
              />
            </div>

            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Produtos Cadastrados
              </h2>

              <form
                onSubmit={handleSearch}
                className="flex flex-col md:flex-row gap-4 mb-6"
              >
                <div className="flex-grow">
                  <Input
                    type="text"
                    placeholder="Buscar produtos por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
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
                </div>
                <Button type="submit">Buscar</Button>
              </form>

              <ProductList
                products={products}
                loading={loading}
                error={error}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>

            <EditProductDialog
              product={selectedProduct}
              categories={categories}
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onSuccess={() => getProducts({ page: currentPage })}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-8">
            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Adicionar Nova Categoria
              </h2>
              <CategoryForm onSubmitSuccess={getCategories} />
            </div>

            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Categorias Cadastradas
              </h2>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={"outline"}
                        className="text-blue-500 hover:underline"
                        onClick={() => handleEditCategory(category)}
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant={"outline"}
                        className="text-red-500 hover:underline"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && !loading && (
                  <p>Nenhuma categoria cadastrada</p>
                )}
                {loading && <p>Carregando categorias...</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flavors" className="space-y-8">
            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Adicionar Novo Sabor
              </h2>
              <FlavorForm
                categories={categories}
                onSubmitSuccess={() =>
                  getFlavors({
                    categoryId:
                      flavorCategoryFilter !== "all"
                        ? flavorCategoryFilter
                        : undefined,
                  })
                }
              />
            </div>

            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Sabores Cadastrados
              </h2>

              <div className="mb-6">
                <Label htmlFor="flavor-category-filter">
                  Filtrar por categoria
                </Label>
                <Select
                  value={flavorCategoryFilter}
                  onValueChange={setFlavorCategoryFilter}
                >
                  <SelectTrigger
                    id="flavor-category-filter"
                    className="w-full md:w-72"
                  >
                    <SelectValue placeholder="Todas as categorias" />
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

              <FlavorList
                flavors={flavors}
                loading={loading}
                error={error}
                onEdit={handleEditFlavor}
                onDelete={handleDeleteFlavor}
              />
            </div>

            <EditFlavorDialog
              flavor={selectedFlavor}
              categories={categories}
              open={isFlavorDialogOpen}
              onOpenChange={setIsFlavorDialogOpen}
              onSuccess={() =>
                getFlavors({
                  categoryId:
                    flavorCategoryFilter !== "all"
                      ? flavorCategoryFilter
                      : undefined,
                })
              }
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Configurar Exibição de Produtos
              </h2>
              {/* Passando key para forçar remontagem apenas quando necessário */}
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

export default DashBoard;
