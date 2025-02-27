import React from "react";
import { Product } from "../../types/product";
import Image from "next/image";
import LoadingDots from "../LoadingDots";
import { Button } from "../ui/button";
import { formatCurrency } from "../../helpers/formatCurrency";
import { formatDate } from "../../helpers/formatDate";
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../ui/badge";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  pagination?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  onPageChange?: (page: number) => void;
}

const ProductList = ({
  products,
  loading,
  error,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: ProductListProps) => {
  if (loading) {
    return <LoadingDots title="Carregando produtos..." />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center py-4">Nenhum produto encontrado</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-3 pr-2">Imagem</th>
            <th className="py-3 px-2">Nome</th>
            <th className="py-3 px-2">Preço</th>
            <th className="py-3 px-2">Categorias</th>
            <th className="py-3 px-2">Data</th>
            <th className="py-3 px-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-100/10">
              <td className="py-3 pr-2">
                <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-200">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </td>
              <td className="py-3 px-2">{product.name}</td>
              <td className="py-3 px-2">{formatCurrency(product.price)}</td>
              <td className="py-3 px-2">
                <div className="flex flex-wrap gap-1">
                  {product.categories.map((category) => (
                    <Badge
                      key={category.id}
                      className="bg-rose-100 text-rose-950"
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="py-3 px-2">{formatDate(product.createdAt)}</td>
              <td className="py-3 px-2">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(product)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-500"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange && onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {pagination.total_pages <= 5 ? (
              [...Array(pagination.total_pages)].map((_, i) => (
                <Button
                  key={i}
                  variant={pagination.page === i + 1 ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  onClick={() => onPageChange && onPageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))
            ) : (
              <>
                {pagination.page > 1 && (
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange && onPageChange(1)}
                  >
                    1
                  </Button>
                )}

                {pagination.page > 2 && <span className="px-1">...</span>}

                {pagination.page > 1 && (
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      onPageChange && onPageChange(pagination.page - 1)
                    }
                  >
                    {pagination.page - 1}
                  </Button>
                )}

                <Button variant="default" className="h-8 w-8 p-0">
                  {pagination.page}
                </Button>

                {pagination.page < pagination.total_pages && (
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      onPageChange && onPageChange(pagination.page + 1)
                    }
                  >
                    {pagination.page + 1}
                  </Button>
                )}

                {pagination.page < pagination.total_pages - 1 && (
                  <span className="px-1">...</span>
                )}

                {pagination.page < pagination.total_pages && (
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      onPageChange && onPageChange(pagination.total_pages)
                    }
                  >
                    {pagination.total_pages}
                  </Button>
                )}
              </>
            )}
          </div>

          <Button
            variant="outline"
            disabled={pagination.page >= pagination.total_pages}
            onClick={() => onPageChange && onPageChange(pagination.page + 1)}
          >
            Próximo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
