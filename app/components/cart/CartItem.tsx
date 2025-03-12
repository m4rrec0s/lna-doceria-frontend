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
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeItem, updateItemQuantity } = useCart();

  const itemTotal = item.price * item.quantity;
  console.log("Item no CartItem:", item);

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

  const renderSelectedFlavors = () => {
    if (!item.selectedFlavors || item.selectedFlavors.length === 0) {
      return null;
    }

    return (
      <div className="mt-2">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs text-gray-400">Sabores:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info size={12} className="text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Mix de sabores selecionados</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-wrap gap-1">
          {item.selectedFlavors.map((flavor, index) => (
            <div key={index} className="relative group">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-700">
                {isValidImageUrl(flavor.imageUrl) ? (
                  <Image
                    src={flavor.imageUrl || "/logo.png"}
                    alt={flavor.name}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[8px] text-gray-800 dark:text-gray-200">
                    {flavor.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-pink-500">
                {index + 1}
              </Badge>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 rounded px-1 py-0.5 text-[8px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {flavor.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
    <div className="flex py-4 border-b border-gray-700">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-700 relative">
        <Image
          src={getProductImage()}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium">
          <h3 className="line-clamp-1">{item.name}</h3>
          <div className="text-right">
            {item.discount ? (
              <div className="flex flex-col">
                <span className="text-gray-400 line-through text-xs">
                  {formatCurrency(itemTotal)}
                </span>
                <span className="text-pink-400 font-bold">
                  {formatCurrency(discountedTotal)}
                </span>
              </div>
            ) : (
              <span>{formatCurrency(itemTotal)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mt-2">
          <div className="text-gray-400">
            <div className="flex items-center gap-1">
              {item.packageInfo && <Package2 className="h-3 w-3" />}
              {formatCurrency(item.price)} cada
              {item.sellingType && (
                <Badge variant="outline" className="text-[10px] py-0 h-4 ml-1">
                  {getSellingTypeLabel()}
                </Badge>
              )}
            </div>
            {item.discount ? (
              <span className="ml-2 text-xs text-pink-400">
                ({item.discount}% off)
              </span>
            ) : null}
          </div>
        </div>

        {renderSelectedFlavors()}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
            >
              <Minus size={16} />
            </Button>
            <span className="px-2 text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={handleIncrement}
            >
              <Plus size={16} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
