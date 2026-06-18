"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../types/product";
import { toast } from "sonner";
import { Flavor } from "../types/flavor";

export interface CartItem extends Product {
  cartItemId: string;
  discount?: number;
  quantity: number;
  flavorId?: string;
  selectedFlavors?: Flavor[];
  flavorSelectionRules?: {
    min: number;
    max: number;
  };
  packageInfo?: {
    quantity: number;
    packageSize: number;
    totalUnits: number;
  };
  sellingType?: string;
  isSpecificQuantity?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    options: {
      quantity: number;
      flavorId?: string;
      selectedFlavors?: Flavor[];
      flavorSelectionRules?: {
        min: number;
        max: number;
      };
      packageInfo?: {
        quantity: number;
        packageSize: number;
        totalUnits: number;
      };
      isSpecificQuantity?: boolean;
    }
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateItemQuantity: (cartItemId: string, newQuantity: number) => void;
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
      flavorSelectionRules,
      packageInfo,
      isSpecificQuantity,
    }: {
      quantity: number;
      flavorId?: string;
      selectedFlavors?: Flavor[];
      flavorSelectionRules?: {
        min: number;
        max: number;
      };
      packageInfo?: {
        quantity: number;
        packageSize: number;
        totalUnits: number;
      };
      isSpecificQuantity?: boolean;
    }
  ) => {
    const generateCartItemId = () => {
      const base = product.id;
      const packageKey = packageInfo ? `-pkg-${packageInfo.packageSize}` : '';
      const flavorsKey = selectedFlavors?.length 
        ? `-flavors-${selectedFlavors.map(f => f.id).sort().join('-')}` 
        : '';
      const specificKey = isSpecificQuantity ? `-specific-${packageInfo?.packageSize || quantity}` : '';
      return `${base}${packageKey}${flavorsKey}${specificKey}`;
    };

    const cartItemId = generateCartItemId();

    // Calculate correct price
    let itemPrice = Number(product.price || 0);
    
    if (isSpecificQuantity && packageInfo) {
      // For specific quantity: total price = unitPrice * quantity
      itemPrice = itemPrice * packageInfo.packageSize;
    } else if (packageInfo && Array.isArray(product.packagePrices)) {
      // For package: get package price from packagePrices
      const packageData = product.packagePrices.find(
        (p) => Number(p.quantity) === packageInfo.packageSize
      );
      if (packageData) {
        itemPrice = Number(packageData.price);
      }
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.cartItemId === cartItemId);

      if (selectedFlavors && selectedFlavors.length > 0) {
        setIsCartOpen(true);
        return [
          ...prevItems,
          {
            ...product,
            cartItemId,
            price: itemPrice,
            quantity,
            selectedFlavors,
            flavorSelectionRules,
            packageInfo,
            isSpecificQuantity,
          },
        ];
      } else if (existingItem) {
        setIsCartOpen(true);
        return prevItems.map((i) =>
          i.cartItemId === cartItemId
            ? {
                ...i,
                quantity: i.quantity + quantity,
                flavorId,
                flavorSelectionRules,
                packageInfo,
                isSpecificQuantity,
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
            cartItemId,
            price: itemPrice,
            quantity,
            flavorId,
            flavorSelectionRules,
            packageInfo,
            isSpecificQuantity,
          },
        ];
      }
    });
  };

  const updateItemQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      );

      return updatedItems;
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.cartItemId === cartItemId);
      if (itemToRemove) {
        toast.info(`Removido do carrinho: ${itemToRemove.name}`);
      }
      return prevItems.filter((item) => item.cartItemId !== cartItemId);
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
