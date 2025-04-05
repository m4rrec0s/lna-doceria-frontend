"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../types/product";
import { toast } from "sonner";
import { Flavor } from "../types/flavor";

export interface CartItem extends Product {
  discount?: number;
  quantity: number;
  flavorId?: string;
  selectedFlavors?: Flavor[];
  packageInfo?: {
    quantity: number;
    packageSize: number;
    totalUnits: number;
  };
  sellingType?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    options: {
      quantity: number;
      flavorId?: string;
      selectedFlavors?: Flavor[];
      packageInfo?: {
        quantity: number;
        packageSize: number;
        totalUnits: number;
      };
    }
  ) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalDiscount: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));

    const subTotal = items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
    setSubtotal(subTotal);

    const discount = items.reduce((acc, item) => {
      if (!item.discount) return acc;

      const itemPrice = item.price * item.quantity;
      const itemDiscount = (itemPrice * item.discount) / 100;
      return acc + itemDiscount;
    }, 0);
    setTotalDiscount(discount);

    setTotal(subTotal - discount);
  }, [items]);

  const addItem = (
    product: Product,
    {
      quantity,
      flavorId,
      selectedFlavors,
      packageInfo,
    }: {
      quantity: number;
      flavorId?: string;
      selectedFlavors?: Flavor[];
      packageInfo?: {
        quantity: number;
        packageSize: number;
        totalUnits: number;
      };
    }
  ) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === product.id);

      if (selectedFlavors && selectedFlavors.length > 0) {
        setIsCartOpen(true);
        return [
          ...prevItems,
          {
            ...product,
            quantity,
            selectedFlavors,
            packageInfo,
          },
        ];
      } else if (existingItem) {
        setIsCartOpen(true);
        return prevItems.map((i) =>
          i.id === product.id
            ? {
                ...i,
                quantity: i.quantity + quantity,
                flavorId,
                packageInfo,
              }
            : i
        );
      } else {
        setIsCartOpen(true);
        toast.success(`Adicionado ao carrinho: ${product.name}`);
        return [
          ...prevItems,
          {
            ...product,
            quantity,
            flavorId,
            packageInfo,
          },
        ];
      }
    });
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );

      // const updatedItem = updatedItems.find((item) => item.id === productId);
      // if (updatedItem) {
      //   toast.success(`Quantidade atualizada: ${updatedItem.name}`);
      // }

      return updatedItems;
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === productId);
      if (itemToRemove) {
        toast.info(`Removido do carrinho: ${itemToRemove.name}`);
      }
      return prevItems.filter((item) => item.id !== productId);
    });
  };

  const clearCart = () => {
    toast.info("Carrinho esvaziado");
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        subtotal,
        totalDiscount,
        total,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
