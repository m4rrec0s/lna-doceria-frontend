"use client";

import { Product } from "../../../types/product";
import ProductItem from "@/app/components/productItem";

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

const RelatedProducts = ({
  products,
  title = "Você também pode gostar",
}: RelatedProductsProps) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="">
      <h2 className="mb-6 text-2xl font-bold text-rose-950">{title}</h2>

      <div className="flex gap-4 items-center overflow-x-auto w-full [&::-webkit-scrollbar]:hidden">
        {products.slice(0, 4).map((product) => (
          <div key={product.id} className="min-w-[200px] w-full">
            <ProductItem product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
