import Image from "next/image";
import { Product } from "../types/product";
import { formatCurrency } from "../helpers/formatCurrency";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { applyDiscount } from "../helpers/applyDiscount";

interface ProductItemProps {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  const packageCategory = product.categories?.find(
    (cat) =>
      cat.sellingType === "package" &&
      cat.packageSizes &&
      cat.packageSizes.length > 0,
  );

  const isPackage = !!packageCategory;

  const imageUrl = product.imageUrl || "/placeholder-image.jpg";
  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const finalPrice = applyDiscount(product.price, product.discount);

  return (
    <li className="group flex flex-1 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-sm">
      <div className="relative h-[210px] w-full overflow-hidden bg-zinc-100">
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
          <Badge className="absolute right-3 top-3 z-30 rounded-full border border-rose-100 bg-rose-700 px-2 py-1 text-xs font-semibold text-rose-50 shadow-sm">
            {product.discount}% OFF
          </Badge>
        )}
        <div className="absolute left-3 top-3 z-30 flex max-w-[70%] flex-wrap justify-end gap-1">
          {product.categories?.[0] && (
            <Badge
              key={product.categories[0].id}
              className="rounded-full border border-white/70 bg-white/50 px-2 py-0.5 text-[11px] font-medium text-white text-shadow shadow-sm backdrop-blur-sm truncate"
            >
              {product.categories[0].name}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-grow flex-col p-4">
        <h2 className="mb-2 line-clamp-2 min-h-12 text-base font-semibold text-zinc-900">
          {product.name}
        </h2>

        {isPackage && (
          <div className="mb-2 flex flex-wrap gap-1 text-xs text-zinc-500">
            <span>Vendido em pacotes</span>
          </div>
        )}

        <div className="flex flex-col">
          {hasDiscount && (
            <div className="text-sm text-zinc-500 line-through">
              {formatCurrency(product.price)}
            </div>
          )}
          <div className="text-xl font-bold text-emerald-700">
            {formatCurrency(finalPrice)}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Link
            href={`/product/${product.id}`}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-rose-600 px-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-rose-800"
          >
            Eu quero
          </Link>
        </div>
      </div>
    </li>
  );
};

export default ProductItem;
