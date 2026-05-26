import React from "react";
import Image from "next/image";
import { Trash2, Plus, Minus, Package2, Info } from "lucide-react";
import { Button } from "../ui/button";
import { CartItem as CartItemType } from "../../context/CartContext";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../helpers/formatCurrency";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Badge } from "../ui/badge";

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
      return `Pacote com ${item.packageInfo.packageSize} unidades`;
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
      rounded-3xl
      border
      border-zinc-100
      bg-white
      p-4
      shadow-sm
      transition-all
      duration-200
      hover:border-rose-200
      hover:shadow-md
      ${className}
    `}
    >
      <div className="flex gap-4">
        {/* IMAGE */}
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
          <Image
            src={getProductImage()}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {item.discount && (
            <div className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white shadow">
              -{item.discount}%
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOP */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-zinc-900">
                {item.name}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {item.packageInfo && (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-zinc-100 text-zinc-600"
                  >
                    <Package2 className="mr-1 h-3.5 w-3.5" />
                    {getSellingTypeLabel()}
                  </Badge>
                )}

                <Badge
                  variant="outline"
                  className="rounded-full border-zinc-200 text-zinc-500"
                >
                  {formatCurrency(item.price)} cada
                </Badge>
              </div>
            </div>

            {/* PRICE */}
            <div className="text-right">
              {item.discount ? (
                <div className="flex flex-col items-end">
                  <span className="text-xs text-zinc-400 line-through">
                    {formatCurrency(itemTotal)}
                  </span>

                  <span className="text-lg font-bold tracking-tight text-rose-600">
                    {formatCurrency(discountedTotal)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold tracking-tight text-zinc-900">
                  {formatCurrency(itemTotal)}
                </span>
              )}
            </div>
          </div>

          {/* FLAVORS */}
          {item.selectedFlavors && item.selectedFlavors?.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Sabores
                </span>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={13} className="cursor-help text-zinc-400" />
                    </TooltipTrigger>

                    <TooltipContent>Mix de sabores selecionados</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.selectedFlavors.map((flavor) => (
                  <div
                    key={flavor.id}
                    className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-zinc-200
                    bg-zinc-50
                    pr-3
                    overflow-hidden
                  "
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-zinc-200">
                      {isValidImageUrl(flavor.imageUrl) ? (
                        <Image
                          src={flavor.imageUrl || "/logo.png"}
                          alt={flavor.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] font-medium text-zinc-600">
                          {flavor.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <span className="max-w-[90px] truncate text-xs font-medium text-zinc-700">
                      {flavor.name}
                    </span>
                  </div>
                ))}
              </div>

              {item.flavorSelectionRules && (
                <p className="mt-2 text-xs text-zinc-400">
                  Escolha entre {item.flavorSelectionRules.min} e{" "}
                  {item.flavorSelectionRules.max} sabores
                </p>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
            {/* QUANTITY */}
            <div className="flex items-center rounded-2xl border border-zinc-200 bg-zinc-50 p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDecrement}
                disabled={item.quantity <= 1}
                className="
                h-8
                w-8
                rounded-xl
                text-zinc-600
                hover:bg-white
              "
              >
                <Minus size={16} />
              </Button>

              <span className="w-10 text-center text-sm font-semibold text-zinc-900">
                {item.quantity}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleIncrement}
                className="
                h-8
                w-8
                rounded-xl
                text-zinc-600
                hover:bg-white
              "
              >
                <Plus size={16} />
              </Button>
            </div>

            {/* REMOVE */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.id)}
              className="
              gap-2
              rounded-xl
              text-zinc-500
              hover:bg-red-50
              hover:text-red-500
            "
            >
              <Trash2 size={16} />
              Remover
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
