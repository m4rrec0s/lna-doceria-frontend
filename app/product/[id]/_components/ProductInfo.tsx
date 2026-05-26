"use client";

import { formatCurrency } from "../../../helpers/formatCurrency";
import { applyDiscount } from "../../../helpers/applyDiscount";
import { Category } from "../../../types/category";
import { Badge } from "../../../components/ui/badge";

interface ProductInfoProps {
  name: string;
  price: number;
  description: string;
  categories: Category[];
  discount?: number;
}

const ProductInfo = ({
  name,
  price,
  description,
  categories = [],
  discount = 0,
}: ProductInfoProps) => {
  const hasDiscount = discount > 0;
  const discountedPrice = applyDiscount(price, discount);
  const savedAmount = price - discountedPrice;

  return (
    <section className="space-y-4">
      {categories && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={"outline"}
              className="border-rose-200 bg-rose-50 font-semibold text-rose-700"
            >
              {category.name}
            </Badge>
          ))}
          {hasDiscount && (
            <Badge className="bg-rose-400 text-rose-950">{discount}% OFF</Badge>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-rose-950 md:text-4xl">{name}</h1>
        <p className="text-sm text-zinc-600">Doces artesanais com toque premium.</p>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-4">
        {hasDiscount ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-lg text-zinc-500 line-through">
                {formatCurrency(price)}
              </span>
              <span className="text-3xl font-semibold text-rose-700">
                {formatCurrency(discountedPrice)}
              </span>
            </div>
            <div className="mt-1 text-sm text-rose-700">
              Você economiza {formatCurrency(savedAmount)} ({discount}% de desconto)
            </div>
          </div>
        ) : (
          <span className="text-3xl font-semibold text-rose-700">
            {formatCurrency(price)}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-4">
        <p className="text-sm text-zinc-600">{description}</p>
      </div>
    </section>
  );
};

export default ProductInfo;
