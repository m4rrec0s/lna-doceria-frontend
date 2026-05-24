"use client";

import { motion } from "framer-motion";
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
}

const AddToCartButton = ({
  onClick,
  product,
  disabled,
  selectedFlavorId,
  selectedFlavors,
  minFlavors = 0,
  maxFlavors = 0,
}: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // Determinar o tipo de venda e tamanhos de pacote
  const packageCategory = product.categories?.find(
    (cat) => cat.sellingType === "package",
  );
  const sellingType = packageCategory ? "package" : "unit";
  let packageSizes: number[] = [];
  if (packageCategory && packageCategory.packageSizes) {
    packageSizes =
      typeof packageCategory.packageSizes === "string"
        ? JSON.parse(packageCategory.packageSizes)
        : Array.isArray(packageCategory.packageSizes)
          ? packageCategory.packageSizes
          : [];
  }

  const getQuantityText = () => {
    if (sellingType === "package" && packageSizes.length > 0) {
      const totalItems = packageSizes[0] * quantity;
      return `${quantity} ${
        quantity === 1 ? "pacote" : "pacotes"
      } (${totalItems} unidades)`;
    }

    return `${quantity} ${quantity === 1 ? "unidade" : "unidades"}`;
  };

  const getTotalPrice = () => {
    const unitPrice = Number((product as Product)?.price) || 0;
    return unitPrice * quantity;
  };

  const handleClick = () => {
    const selectedCount = selectedFlavors?.length || 0;
    if (maxFlavors > 0) {
      if (selectedCount < minFlavors) {
        toast.error(`Selecione pelo menos ${minFlavors} sabores.`);
        return;
      }

      if (selectedCount > maxFlavors) {
        toast.error(`Você pode selecionar no máximo ${maxFlavors} sabores.`);
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      addItem(product, {
        quantity,
        flavorId: selectedFlavorId || undefined,
        selectedFlavors: selectedFlavors,
        flavorSelectionRules:
          maxFlavors > 0
            ? {
                min: minFlavors,
                max: maxFlavors,
              }
            : undefined,
        packageInfo:
          sellingType === "package" && packageSizes.length
            ? {
                quantity: quantity,
                packageSize: packageSizes[0],
                totalUnits: quantity * packageSizes[0],
              }
            : undefined,
      });
      onClick();
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="h-10 w-10 rounded-full border border-rose-200 bg-white p-0 text-rose-600 hover:bg-rose-50"
            disabled={quantity <= 1}
          >
            <MinusCircle size={24} />
          </Button>

          <span className="min-w-10 text-center text-xl font-semibold text-zinc-900">
            {quantity}
          </span>

          <Button
            onClick={() => setQuantity((prev) => prev + 1)}
            className="h-10 w-10 rounded-full border border-rose-200 bg-white p-0 text-rose-600 hover:bg-rose-50"
          >
            <PlusCircle size={24} />
          </Button>
        </div>

        <div className="text-right text-sm text-zinc-600">
          {getQuantityText()}
        </div>
      </div>

      {selectedFlavors && selectedFlavors.length > 0 && (
        <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
          <p className="text-sm font-medium mb-2">
            Sabores selecionados ({selectedFlavors.length}
            {maxFlavors > 0 ? `/${maxFlavors}` : ""}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedFlavors.map((flavor, index) => (
              <div
                key={flavor.id}
                className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs"
              >
                <span className="w-3 h-3 rounded-full bg-pink-500 flex items-center justify-center text-[8px] text-white font-bold">
                  {index + 1}
                </span>
                {flavor.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.button
        onClick={handleClick}
        disabled={isLoading || disabled}
        className={`flex w-full items-center justify-center gap-2 rounded-xl p-4 font-medium ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-rose-300 text-rose-950 hover:bg-rose-400"
        }`}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isLoading ? (
          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            <span>
              <ShoppingCart />
            </span>
            <span>Adicionar por {formatCurrency(getTotalPrice())}</span>
          </>
        )}
      </motion.button>

      {sellingType === "package" && packageSizes.length > 0 && (
        <p className="text-center text-sm text-zinc-600">
          Este produto é vendido em pacote{packageSizes.length > 1 ? "s" : ""}{" "}
          com {packageSizes.join(", ")} unidades cada.
        </p>
      )}
    </div>
  );
};

export default AddToCartButton;
