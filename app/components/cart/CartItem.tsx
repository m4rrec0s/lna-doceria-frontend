import React from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { CartItem as CartItemType } from "../../context/CartContext";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../helpers/formatCurrency";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const itemTotal = item.price * item.quantity;
  const discountedTotal = item.discount
    ? itemTotal - (itemTotal * item.discount) / 100
    : itemTotal;

  return (
    <div className="flex py-4 border-b border-gray-700">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-700 relative">
        <Image
          src={item.imageUrl}
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
            {formatCurrency(item.price)} cada
            {item.discount ? (
              <span className="ml-2 text-xs text-pink-400">
                ({item.discount}% off)
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center border border-gray-600 rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
            >
              <Minus size={14} />
            </Button>
            <span className="px-2">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
            >
              <Plus size={14} />
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
