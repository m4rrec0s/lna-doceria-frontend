"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../types/product";
import { toast } from "sonner";

export interface CartItem extends Product {
  discount?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalDiscount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));

    const subTotal = items.reduce((acc, item) => acc + item.price * 1, 0);
    setSubtotal(subTotal);

    const discount = items.reduce((acc, item) => {
      const itemDiscount = item.discount
        ? (item.price * 1 * item.discount) / 100
        : 0;
      return acc + itemDiscount;
    }, 0);
    setTotalDiscount(discount);

    setTotal(subTotal - discount);
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        toast.success(`Quantidade atualizada: ${product.name}`);
        return prevItems.map((item) =>
          item.id === product.id ? { ...item } : item
        );
      } else {
        toast.success(`Adicionado ao carrinho: ${product.name}`);
        return [...prevItems, { ...product }];
      }
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
        clearCart,
        subtotal,
        totalDiscount,
        total,
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
