"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { Product } from "../../../types/product";
import { Flavor } from "../../../types/flavor";
import { MinusCircle, PlusCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface AddToCartButtonProps {
  onClick: () => void;
  product: Product;
  disabled?: boolean;
  selectedFlavorId?: string | null;
  selectedFlavors?: Flavor[];
}

const AddToCartButton = ({
  onClick,
  product,
  disabled,
  selectedFlavorId,
  selectedFlavors,
}: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // Determinar o tipo de venda e tamanhos de pacote
  const packageCategory = product.categories?.find(
    (cat) => cat.sellingType === "package"
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

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      addItem(product, {
        quantity,
        flavorId: selectedFlavorId || undefined,
        selectedFlavors: selectedFlavors,
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className=""
            disabled={quantity <= 1}
          >
            <MinusCircle size={24} />
          </Button>

          <span className="font-medium text-xl">{quantity}</span>

          <Button onClick={() => setQuantity((prev) => prev + 1)} className="">
            <PlusCircle size={24} />
          </Button>
        </div>

        <div className="text-gray-600">{getQuantityText()}</div>
      </div>

      {selectedFlavors && selectedFlavors.length > 0 && (
        <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
          <p className="text-sm font-medium mb-2">
            Sabores selecionados ({selectedFlavors.length}/5):
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
        className={`w-full p-4 rounded-full font-medium flex items-center justify-center gap-2 ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-pink-500 text-white hover:bg-pink-600"
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
            <span>Adicionar ao carrinho</span>
            <span className="text-lg">🛒</span>
          </>
        )}
      </motion.button>

      {sellingType === "package" && packageSizes.length > 0 && (
        <p className="text-sm text-gray-600 text-center">
          Este produto é vendido em pacote{packageSizes.length > 1 ? "s" : ""}{" "}
          com {packageSizes.join(", ")} unidades cada.
        </p>
      )}
    </div>
  );
};

export default AddToCartButton;
