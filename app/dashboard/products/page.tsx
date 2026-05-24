'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Plus, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { useApi } from '@/app/hooks/useApi';
import { Product } from '../../types/product';
import ProductForm from '../../components/dashboard/ProductForm';
import ProductList from '../../components/dashboard/ProductList';
import { EditProductDialog } from '../../components/dashboard/EditProductDialog';
import './products.css';

export default function ProductsPage() {
  const {
    products,
    categories,
    error,
    loading,
    pagination,
    getProducts,
    getCategories,
    deleteProduct,
  } = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    getProducts();
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
      toast.success('Produto deletado com sucesso!');
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      toast.error('Erro ao deletar produto');
    }
  };

  const handlePageChange = (page: number) => {
    getProducts({ page, per_page: pagination.per_page });
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
        <Button onClick={() => setIsCreateDialogOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </motion.div>

      <div className="products-toolbar">
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
      >
        <ProductList
          products={filteredProducts}
          loading={loading}
          error={error || null}
          onEdit={(product) => {
            setSelectedProduct(product);
            setIsEditDialogOpen(true);
          }}
          onDelete={handleDeleteProduct}
          pagination={searchTerm ? undefined : pagination}
          onPageChange={searchTerm ? undefined : handlePageChange}
        />
      </motion.div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={categories ?? []}
            onSubmitSuccess={() => {
              getProducts({ page: 1, per_page: pagination.per_page }, true);
              setIsCreateDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <EditProductDialog
        product={selectedProduct}
        categories={categories ?? []}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          getProducts({ page: pagination.page, per_page: pagination.per_page }, true);
          setIsEditDialogOpen(false);
        }}
      />
    </div>
  );
}
