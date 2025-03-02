import Image from "next/image";
import { Product } from "../types/product";
import { formatCurrency } from "../helpers/formatCurrency";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShoppingBasket, Eye } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { applyDiscount } from "../helpers/applyDiscount";

interface ProductItemProps {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  return (
    <li className="bg-white rounded-2xl w-[250px] h-[420px] shadow-lg flex flex-col transition-transform duration-300 hover:translate-y-[-5px]">
      <div className="w-full h-[200px] relative">
        <div className="absolute inset-0 p-4">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-t-2xl"
          />
        </div>
        {product.discount && product.discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-rose-700 text-rose-100 px-2 py-1 z-30 rounded-full border border-rose-100 text-xs font-medium shadow-sm">
            {product.discount}% OFF
          </Badge>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h2 className="font-semibold text-base text-rose-800 font-poppins line-clamp-2 text-center mb-2">
          {product.name}
        </h2>

        <div className="flex justify-center gap-1 flex-wrap mb-2 max-h-[40px] overflow-hidden">
          {product.categories.slice(0, 2).map((category) => (
            <Badge
              key={category.id}
              className="bg-rose-100 text-rose-700 px-2 py-0.5 text-xs rounded-full"
            >
              {category.name}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col">
          {product.discount && product.discount > 0 && (
            <div className="text-sm text-gray-500 text-center line-through">
              {formatCurrency(product.price)}
            </div>
          )}
          <div className="text-lg font-bold text-rose-600 font-poppins text-center">
            {formatCurrency(applyDiscount(product.price, product.discount))}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href={`/product/${product.id}`}
            className="flex items-center justify-center text-rose-500 hover:text-rose-600 text-sm font-medium transition-colors duration-200"
          >
            <Eye size={16} className="mr-1" /> Ver detalhes
          </Link>

          <Button
            className="bg-rose-400 text-white hover:bg-rose-500 text-sm h-9 px-3 py-1 transition-colors duration-200 rounded-full font-medium w-full"
            onClick={handleAddToCart}
          >
            <ShoppingBasket size={16} className="mr-1" /> Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </li>
  );
};

export default ProductItem;
