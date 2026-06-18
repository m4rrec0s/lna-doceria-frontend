"use client";

import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { Product } from "../../../types/product";
import { Flavor } from "../../../types/flavor";
import { MinusCircle, PlusCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/app/utils/format";

interface AddToCartButtonProps {
  onClick: () => void;
  product: Product;
  disabled?: boolean;
  selectedFlavorId?: string | null;
  selectedFlavors?: Flavor[];
  minFlavors?: number;
  maxFlavors?: number;
  selectedGram?: number | null;
  selectedPackageSize?: number | null;
  onSelectedPackageSizeChange?: (value: number | null) => void;
  useSpecificQuantity?: boolean;
  specificQuantity?: number;
  quantity?: number;
  onQuantityChange?: (value: number) => void;
}

const AddToCartButton = ({
  onClick,
  product,
  disabled,
  selectedFlavors,
  minFlavors = 0,
  maxFlavors = 0,
  selectedPackageSize: selectedPackageSizeProp,
  useSpecificQuantity = false,
  specificQuantity = 1,
  quantity: quantityProp,
  onQuantityChange,
}: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [internalQuantity, setInternalQuantity] = useState(1);
  const { addItem } = useCart();

  const hasPackageSelected =
    selectedPackageSizeProp !== null &&
    selectedPackageSizeProp !== undefined &&
    !useSpecificQuantity;

  const quantity = useSpecificQuantity
    ? 1
    : hasPackageSelected
      ? 1
      : quantityProp !== undefined
        ? quantityProp
        : internalQuantity;

  const setQuantity = (value: number | ((prev: number) => number)) => {
    const nextValue = typeof value === "function" ? value(quantity) : value;
    if (onQuantityChange) {
      onQuantityChange(nextValue);
      return;
    }
    setInternalQuantity(nextValue);
  };

  // Get package price from product.packagePrices
  const packagePrice = hasPackageSelected
    ? (() => {
        const packages = Array.isArray(product.packagePrices)
          ? product.packagePrices
          : [];
        const found = packages.find(
          (p) => Number(p.quantity) === selectedPackageSizeProp,
        );
        return found ? Number(found.price) : null;
      })()
    : null;

  const displayPrice = useSpecificQuantity
    ? Number(product.price || 0) * specificQuantity
    : hasPackageSelected && packagePrice !== null
      ? packagePrice
      : Number(product.price || 0) * quantity;

  const handleAddToCart = async () => {
    if (disabled || isLoading) return;
    if (
      minFlavors > 0 &&
      (!selectedFlavors || selectedFlavors.length < minFlavors)
    ) {
      toast.error(
        `Selecione pelo menos ${minFlavors} sabor${minFlavors > 1 ? "es" : ""}.`,
      );
      return;
    }
    if (
      useSpecificQuantity &&
      product.unitMinQuantity &&
      specificQuantity < product.unitMinQuantity
    ) {
      toast.error(`Quantidade mínima: ${product.unitMinQuantity} unidades.`);
      return;
    }
    setIsLoading(true);

    try {
      addItem(product, {
        quantity: hasPackageSelected ? 1 : useSpecificQuantity ? 1 : quantity,
        selectedFlavors:
          selectedFlavors && selectedFlavors.length > 0
            ? selectedFlavors
            : undefined,
        flavorSelectionRules:
          minFlavors > 0 || maxFlavors > 0
            ? { min: minFlavors, max: maxFlavors }
            : undefined,
        packageInfo: hasPackageSelected
          ? {
              quantity: 1,
              packageSize: selectedPackageSizeProp,
              totalUnits: selectedPackageSizeProp,
            }
          : useSpecificQuantity
            ? {
                quantity: 1,
                packageSize: specificQuantity,
                totalUnits: specificQuantity,
              }
            : undefined,
        isSpecificQuantity: useSpecificQuantity,
      });

      onClick?.();
      toast.success(`${product.name} adicionado ao carrinho!`);
    } catch {
      toast.error("Erro ao adicionar ao carrinho");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {!hasPackageSelected && !useSpecificQuantity && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="text-rose-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
          >
            <MinusCircle size={28} />
          </button>
          <span className="min-w-[2.5rem] text-center text-lg font-bold text-rose-950">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="text-rose-400 hover:text-rose-600 transition-colors"
          >
            <PlusCircle size={28} />
          </button>
        </div>
      )}

      {hasPackageSelected && (
        <p className="text-center text-sm text-zinc-500">
          Pacote com{" "}
          <span className="font-bold text-rose-700">
            {selectedPackageSizeProp}
          </span>{" "}
          unidades
        </p>
      )}

      {useSpecificQuantity && (
        <p className="text-center text-sm text-zinc-500">
          1 pacote com{" "}
          <span className="font-bold text-amber-700">{specificQuantity}</span>{" "}
          {specificQuantity === 1 ? "unidade" : "unidades"}
        </p>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        className="w-full rounded-2xl bg-rose-500 py-6 text-sm font-bold text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ShoppingCart size={18} />
            Adicionar — {formatCurrency(displayPrice)}
          </span>
        )}
      </Button>
    </div>
  );
};

export default AddToCartButton;
