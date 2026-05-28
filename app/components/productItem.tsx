import Image from "next/image";
import { Product } from "../types/product";
import { formatCurrency } from "../helpers/formatCurrency";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { applyDiscount } from "../helpers/applyDiscount";
import {
  hasPackagingOptions,
  getProductOptions,
} from "../helpers/getProductPricingType";

interface ProductItemProps {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  const imageUrl = product.imageUrl || "/placeholder-image.jpg";
  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const finalPrice = applyDiscount(product.price, product.discount);
  const hasOptions = hasPackagingOptions(product);
  const options = hasOptions ? getProductOptions(product) : [];

  return (
    <li className="group flex flex-1 min-w-0 md:min-w-[200px] xl:min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-sm">
      <div className="relative h-[160px] sm:h-[210px] w-full overflow-hidden bg-zinc-100">
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {hasDiscount && (
          <Badge className="absolute right-3 top-3 z-30 rounded-full border border-rose-100 bg-rose-700 px-2 py-1 text-xs font-semibold text-rose-50 shadow-sm whitespace-nowrap">
            {product.discount}% OFF
          </Badge>
        )}
      </div>

      <div className="flex flex-grow flex-col p-3 sm:p-4">
        <h2 className="mb-2 line-clamp-2 min-h-[2.75rem] text-sm sm:text-base font-semibold text-zinc-900">
          {product.name}
        </h2>

        <div className="flex flex-col">
          {product.unitMinQuantity && product.price > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">escolha a quantidade</p>
              <p className="text-xs font-semibold text-amber-700">
                no mínimo {product.unitMinQuantity} un.
              </p>
            </div>
          ) : hasOptions ? (
            <div className="space-y-2">
              <p className="text-xs text-zinc-600">Opções disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {options.map((option, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-rose-50 border-rose-200 text-rose-700 text-xs"
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <>
              {hasDiscount && (
                <div className="text-xs sm:text-sm text-zinc-500 line-through">
                  {formatCurrency(product.price)}
                </div>
              )}
              <div className="text-lg sm:text-xl font-bold text-emerald-700">
                {formatCurrency(finalPrice)}
              </div>
            </>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-3 sm:pt-4">
          <Link
            href={`/product/${product.id}`}
            className="flex h-9 sm:h-10 w-full items-center justify-center rounded-lg bg-rose-600 px-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-rose-800"
          >
            Eu quero
          </Link>
        </div>
      </div>
    </li>
  );
};

export default ProductItem;
