import React from "react";
import { Product } from "../../types/product";
import Image from "next/image";
import LoadingDots from "../LoadingDots";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductList = ({
  products,
  loading,
  error,
  onEdit,
  onDelete,
}: ProductListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingDots />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 p-4 rounded text-red-700">{error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum produto cadastrado. Adicione seu primeiro produto acima!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse p-2">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Imagem
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preço
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Desconto
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categorias
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="w-16 h-16 relative bg-gray-100 rounded">
                  <Image
                    src={product.imageUrl || "/placeholder-product.png"}
                    alt={product.name}
                    fill
                    className="object-contain rounded"
                    sizes="64px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-product.png";
                    }}
                  />
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {product.name}
                </div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {product.description}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {product.discount ? `${product.discount}%` : "-"}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {product.categories
                    .map((category) => category.name)
                    .join(", ")}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Button
                  onClick={() => onEdit(product)}
                  className="text-blue-500 hover:underline"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => onDelete(product.id)}
                  className="text-red-500 hover:underline ml-2"
                >
                  Excluir
                </Button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
