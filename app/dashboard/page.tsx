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
import { Trash2 } from "lucide-react";
// import ProductDisplaySettings from "../components/dashboard/ProductDisplaySettings";

const DashBoard = () => {
  const { user } = useAuth();
  const {
    products,
    categories,
    loading,
    error,
    getProducts,
    getCategories,
    updateCategory,
    deleteProduct,
    deleteCategory,
  } = useApi();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    getProducts();
    getCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setCategoryName(selectedCategory.name);
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

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory && categoryName.trim()) {
      await updateCategory(selectedCategory.id, {
        ...selectedCategory,
        name: categoryName,
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

  const handleProductUpdated = () => {
    getProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteProduct(id);
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
          <TabsList className="grid grid-cols-3 max-w-md mb-6">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Adicionar Novo Produto
              </h2>
              <ProductForm
                categories={categories}
                onSubmitSuccess={handleProductUpdated}
              />
            </div>

            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Produtos Cadastrados
              </h2>
              <ProductList
                products={products}
                loading={loading}
                error={error}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </div>

            <EditProductDialog
              product={selectedProduct}
              categories={categories}
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onSuccess={handleProductUpdated}
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

          <TabsContent value="settings" className="space-y-8">
            <div className="p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Configurar Exibição de Produtos
              </h2>
              {/* <ProductDisplaySettings 
                categories={categories} 
                products={products}
              /> */}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome da Categoria</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nome da categoria"
                required
              />
            </div>

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
