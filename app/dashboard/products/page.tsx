"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";
import { useApi } from "@/app/hooks/useApi";
import { Product } from "../../types/product";
import ProductList from "../../components/dashboard/ProductList";
import "./products.css";

export default function ProductsPage() {
  const router = useRouter();
  const {
    products,
    error,
    loading,
    pagination,
    getAllProducts,
    getCategories,
    deleteProduct,
    updateProduct,
    updateLocalProductState,
  } = useApi();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllProducts();
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter((product) =>
      product.name?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      await getAllProducts(
        { page: pagination.page, per_page: pagination.per_page },
        true
      );
      toast.success("Produto deletado com sucesso!");
    } catch (err) {
      console.error("Erro ao deletar produto:", err);
      toast.error("Erro ao deletar produto");
    }
  };

  const handlePageChange = (page: number) => {
    getAllProducts({ page, per_page: pagination.per_page });
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const updatedActive = !product.active;
      await updateProduct(product.id, { active: updatedActive });
      updateLocalProductState(product.id, { active: updatedActive });
      toast.success(updatedActive ? "Produto ativado" : "Produto desativado");
    } catch {
      toast.error("Não foi possível atualizar o status do produto");
    }
  };

  return (
    <div className="products-page">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header products-header"
      >
        <div>
          <h1>Produtos</h1>
          <p>Gerencie seu catálogo de produtos</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/products/form")}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </motion.div>

      <div className="products-toolbar rounded-2xl border border-rose-100 bg-white/90 p-3 shadow-sm">
        <div className="search-bar">
          <Search className="search-icon" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <Button variant="outline" className="filter-btn" disabled>
          <Filter className="w-4 h-4" />
          Filtrar
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
      >
        <ProductList
          products={filteredProducts}
          loading={loading}
          error={error || null}
          onEdit={(product) => router.push(`/dashboard/products/form?id=${product.id}`)}
          onDelete={handleDeleteProduct}
          onToggleActive={handleToggleActive}
          pagination={searchTerm ? undefined : pagination}
          onPageChange={searchTerm ? undefined : handlePageChange}
        />
      </motion.div>
    </div>
  );
}

