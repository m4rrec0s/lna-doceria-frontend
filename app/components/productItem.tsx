import Image from "next/image";
import { Product } from "../types/product";
import { formatCurrency } from "../helpers/formatCurrency";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { EyeIcon, ShoppingBasket } from "lucide-react";

interface ProductItemProps {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  return (
    <li
      key={product.id}
      className="min-w-[200px] max-w-[300px] flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow text-black"
    >
      <div className="w-full h-[200px] relative p-4">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex flex-col items-center w-full">
          <h2 className="font-semibold text-lg truncate">{product.name}</h2>
          <div className="text-xl font-bold text-secondary">
            {formatCurrency(product.price)}
          </div>
        </div>
        <div className="flex justify-center gap-3 my-4">
          {product.categories.length > 0 ? (
            product.categories.map((category) => {
              return (
                <Badge key={category.id} className="bg-rose-100 text-rose-950">
                  {category.name}
                </Badge>
              );
            })
          ) : (
            <Badge className="bg-rose-100 text-rose-950">Sem Categoria</Badge>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 hover:text-opacity-80">
            <span>Ver Detalhes</span> <EyeIcon />
          </Button>
          <Button className="bg-rose-500 text-white hover:bg-rose-600">
            <span>Adicionar ao Carrinho</span> <ShoppingBasket />{" "}
          </Button>
        </div>
      </div>
    </li>
  );
};

export default ProductItem;
