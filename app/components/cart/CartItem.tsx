import React from "react";
import Image from "next/image";
import { Trash2, Plus, Minus, Package2 } from "lucide-react";
import { CartItem as CartItemType } from "../../context/CartContext";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../helpers/formatCurrency";

interface CartItemProps {
  item: CartItemType;
  className?: string;
}

const CartItem: React.FC<CartItemProps> = ({ item, className }) => {
  const { removeItem, updateItemQuantity } = useCart();

  const itemTotal = item.price * item.quantity;
  const discountedTotal = item.discount
    ? itemTotal - (itemTotal * item.discount) / 100
    : itemTotal;

  const handleIncrement = () => {
    updateItemQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateItemQuantity(item.id, item.quantity - 1);
    }
  };

  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    if (typeof url !== "string") return false;
    return url.startsWith("/") || url.includes("http");
  };

  const getSellingTypeLabel = () => {
    if (item.packageInfo) {
      return `${item.packageInfo.packageSize} unids.`;
    }
    return "Unitário";
  };

  const getProductImage = () => {
    if (Array.isArray(item.imageUrl) && item.imageUrl.length > 0) {
      return isValidImageUrl(item.imageUrl[0])
        ? item.imageUrl[0]
        : "/placeholder.png";
    }
    if (isValidImageUrl(item.imageUrl)) {
      return item.imageUrl;
    }
    return "/placeholder.png";
  };

  return (
    <div
      className={`
        group
        rounded-2xl
        border
        border-zinc-100
        bg-white
        p-3
        shadow-sm
        transition-all
        duration-200
        hover:border-rose-100
        hover:shadow-md
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        {/* PRODUCT IMAGE - COMPACT SIZE */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100">
          <Image
            src={getProductImage()}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-102"
          />
          {item.discount && (
            <div className="absolute left-1 top-1 rounded bg-rose-500 px-1 py-0.5 text-[8px] font-bold text-white shadow-sm">
              -{item.discount}%
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TITLE & PRICE ROW */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-xs font-bold text-zinc-900 flex-1 leading-tight group-hover:text-rose-950 transition">
              {item.name}
            </h3>
            
            {/* COMPACT PRICE */}
            <div className="text-right flex-shrink-0">
              {item.discount ? (
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[10px] text-zinc-400 line-through">
                    {formatCurrency(itemTotal)}
                  </span>
                  <span className="text-xs font-bold text-rose-600">
                    {formatCurrency(discountedTotal)}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold text-zinc-900">
                  {formatCurrency(itemTotal)}
                </span>
              )}
            </div>
          </div>

          {/* BADGES & SUBTITLE */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {item.packageInfo ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                <Package2 className="h-3 w-3" />
                {getSellingTypeLabel()}
              </span>
            ) : (
              <span className="text-[10px] text-zinc-400 font-medium bg-zinc-50 border border-zinc-150 px-1.5 py-0.5 rounded-md">
                Unitário
              </span>
            )}
            
            <span className="text-[10px] text-zinc-400 font-medium">
              {formatCurrency(item.price)} cada
            </span>
          </div>

          {/* COMPACT INLINE FLAVORS LIST */}
          {item.selectedFlavors && item.selectedFlavors.length > 0 && (
            <div className="mt-2 text-[10px] text-zinc-550 border-t border-dashed border-zinc-100 pt-1.5">
              <span className="font-semibold text-zinc-650">Sabores selecionados:</span>{" "}
              <span className="italic text-zinc-500">
                {item.selectedFlavors.map((flavor) => flavor.name).join(", ")}
              </span>
            </div>
          )}

          {/* CONTROLS ROW - HYPER COMPACT */}
          <div className="mt-2.5 flex items-center justify-between border-t border-zinc-50 pt-2">
            {/* QUANTITY CONTROL PILL */}
            <div className="flex items-center rounded-lg border border-zinc-150 bg-zinc-50/50 p-0.5">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={item.quantity <= 1 || item.isSpecificQuantity}
                className="h-6 w-6 rounded-md text-zinc-500 hover:bg-white hover:text-zinc-700 flex items-center justify-center disabled:opacity-30 transition"
              >
                <Minus size={11} className="stroke-[3px]" />
              </button>

              <span className="w-7 text-center text-xs font-bold text-zinc-800">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={item.isSpecificQuantity}
                className="h-6 w-6 rounded-md text-zinc-500 hover:bg-white hover:text-zinc-700 flex items-center justify-center disabled:opacity-30 transition"
              >
                <Plus size={11} className="stroke-[3px]" />
              </button>
            </div>

            {/* QUICK TRASH ACTION */}
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="h-7 px-2 rounded-lg text-[10px] font-semibold text-zinc-400 hover:text-red-500 hover:bg-red-50/40 flex items-center gap-1 transition"
            >
              <Trash2 size={12} />
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
