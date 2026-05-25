import React from "react";
import { Product } from "../../types/product";
import Image from "next/image";
// import { LoadingDots } from "../LoadingDots";
import { Button } from "../ui/button";
import { formatCurrency } from "../../helpers/formatCurrency";
import { formatDate } from "../../helpers/formatDate";
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive?: (product: Product) => void;
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
  onToggleActive,
  pagination,
  onPageChange,
}: ProductListProps) => {
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center py-4">Nenhum produto encontrado</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-rose-100 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[88px]">Imagem</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="min-w-[180px]">Categorias</TableHead>
              <TableHead className="w-[120px]">Preço</TableHead>
              <TableHead className="w-[140px]">Sabores</TableHead>
              <TableHead className="w-[140px]">Atualizado</TableHead>
              <TableHead className="w-[170px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-zinc-100">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-zinc-900">{product.name}</span>
                    <Badge
                      className={
                        product.active
                          ? "w-fit bg-emerald-100 text-emerald-800"
                          : "w-fit bg-zinc-200 text-zinc-700"
                      }
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.categories?.map((category) => (
                      <Badge key={category.id} className="bg-rose-100 text-rose-950">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>
                  {(product.maxFlavors ?? 0) > 0
                    ? `${product.minFlavors ?? 0} a ${product.maxFlavors}`
                    : "-"}
                </TableCell>
                <TableCell>{formatDate(product.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      title="Editar produto"
                      disabled={loading}
                      onClick={() => onEdit(product)}
                    >
                      <Edit size={16} />
                    </Button>
                    {onToggleActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading}
                        className={product.active ? "text-green-500" : "text-gray-500"}
                        onClick={() => onToggleActive(product)}
                        title={product.active ? "Desativar produto" : "Ativar produto"}
                      >
                        {product.active ? <Eye size={16} /> : <EyeOff size={16} />}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-500"
                      disabled={loading}
                      title="Excluir produto"
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
