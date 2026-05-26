"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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
}

const AddToCartButton = ({
  onClick,
  product,
  disabled,
  selectedFlavorId,
  selectedFlavors,
  minFlavors = 0,
  maxFlavors = 0,
  selectedGram = null,
  selectedPackageSize: selectedPackageSizeProp,
  onSelectedPackageSizeChange,
}: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const normalizedPackagePrices = useMemo(() => {
    if (!Array.isArray(product.packagePrices)) {
      return [] as { quantity: number; price: number; discount: number | null }[];
    }

    return product.packagePrices
      .map((entry) => ({
        quantity: Number(entry.quantity),
        price: Number(entry.price),
        discount:
          entry.discount === null || entry.discount === undefined
            ? null
            : Number(entry.discount),
      }))
      .filter(
        (entry) =>
          Number.isFinite(entry.quantity) &&
          Number.isFinite(entry.price) &&
          entry.quantity > 0 &&
          entry.price >= 0 &&
          (entry.discount === null ||
            (Number.isFinite(entry.discount) &&
              entry.discount >= 0 &&
              entry.discount <= 100)),
      )
      .sort((a, b) => a.quantity - b.quantity);
  }, [product.packagePrices]);
  const normalizedPackageSizes = useMemo(
    () => normalizedPackagePrices.map((entry) => entry.quantity),
    [normalizedPackagePrices],
  );
  const sellingType = normalizedPackageSizes.length > 0 ? "package" : "unit";
  const normalizedGramsPrices = useMemo(() => {
    if (!Array.isArray(product.gramsPrices)) return [];
    return product.gramsPrices
      .map((entry) => ({
        quantity: Number(entry.quantity),
        price: Number(entry.price),
        discount:
          entry.discount === null || entry.discount === undefined
            ? null
            : Number(entry.discount),
      }))
      .filter(
        (entry) =>
          Number.isFinite(entry.quantity) &&
          Number.isFinite(entry.price) &&
          entry.quantity > 0 &&
          entry.price >= 0 &&
          (entry.discount === null ||
            (Number.isFinite(entry.discount) &&
              entry.discount >= 0 &&
              entry.discount <= 100)),
      )
      .sort((a, b) => a.quantity - b.quantity);
  }, [product.gramsPrices]);

  const [internalSelectedPackageSize, setInternalSelectedPackageSize] =
    useState<number | null>(
      normalizedPackageSizes.length
        ? normalizedPackageSizes[normalizedPackageSizes.length - 1]
        : null,
    );
  const selectedPackageSize =
    selectedPackageSizeProp !== undefined
      ? selectedPackageSizeProp
      : internalSelectedPackageSize;
  const setSelectedPackageSize = (value: number | null) => {
    if (onSelectedPackageSizeChange) {
      onSelectedPackageSizeChange(value);
      return;
    }
    setInternalSelectedPackageSize(value);
  };

  useEffect(() => {
    if (!normalizedPackageSizes.length) {
      setSelectedPackageSize(null);
      return;
    }
    setSelectedPackageSize(
      normalizedPackageSizes[normalizedPackageSizes.length - 1],
    );
  }, [normalizedPackageSizes]);

  const getQuantityText = () => {
    if (sellingType === "package" && normalizedPackageSizes.length > 0) {
      const packageSize = selectedPackageSize || normalizedPackageSizes[0];
      const totalItems = packageSize * quantity;
      return `${quantity} ${
        quantity === 1 ? "pacote" : "pacotes"
      } (${totalItems} unidades)`;
    }

    return `${quantity} ${quantity === 1 ? "unidade" : "unidades"}`;
  };

  const getTotalPrice = () => {
    const basePrice = Number((product as Product)?.price) || 0;
    const baseDiscount = Number(product.discount || 0);
    if (sellingType === "package" && normalizedPackageSizes.length > 0) {
      const packageSize = selectedPackageSize || normalizedPackageSizes[0];
      const selectedPackage = normalizedPackagePrices.find(
        (entry) => entry.quantity === packageSize,
      );
      const resolvedPrice =
        typeof selectedPackage?.price === "number" ? selectedPackage.price : basePrice;
      const resolvedDiscount =
        selectedPackage?.discount === null || selectedPackage?.discount === undefined
          ? baseDiscount
          : selectedPackage.discount;
      return resolvedPrice * (1 - resolvedDiscount / 100) * quantity;
    }
    if (selectedGram && normalizedGramsPrices.length > 0) {
      const selectedGrams = normalizedGramsPrices.find(
        (entry) => entry.quantity === selectedGram,
      );
      const resolvedPrice =
        typeof selectedGrams?.price === "number" ? selectedGrams.price : basePrice;
      const resolvedDiscount =
        selectedGrams?.discount === null || selectedGrams?.discount === undefined
          ? baseDiscount
          : selectedGrams.discount;
      return resolvedPrice * (1 - resolvedDiscount / 100) * quantity;
    }
    return basePrice * (1 - baseDiscount / 100) * quantity;
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
      const packageSize =
        sellingType === "package" && normalizedPackageSizes.length
          ? selectedPackageSize || normalizedPackageSizes[0]
          : null;
      const selectedPackagePrice =
        packageSize !== null
          ? normalizedPackagePrices.find(
              (entry) => entry.quantity === packageSize,
            )?.price
          : undefined;
      const selectedGramsPrice =
        selectedGram !== null
          ? normalizedGramsPrices.find(
              (entry) => entry.quantity === selectedGram,
            )?.price
          : undefined;

      const resolvedUnitPrice =
        packageSize !== null
          ? typeof selectedPackagePrice === "number"
            ? selectedPackagePrice
            : Number(product.price) || 0
          : selectedGram !== null
            ? typeof selectedGramsPrice === "number"
              ? selectedGramsPrice
              : Number(product.price) || 0
            : Number(product.price) || 0;

      const resolvedDiscount = (() => {
        if (packageSize !== null) {
          const selectedPkg = normalizedPackagePrices.find(
            (entry) => entry.quantity === packageSize,
          );
          if (selectedPkg?.discount !== null && selectedPkg?.discount !== undefined) {
            return selectedPkg.discount;
          }
        }
        if (selectedGram !== null) {
          const selectedGramsEntry = normalizedGramsPrices.find(
            (entry) => entry.quantity === selectedGram,
          );
          if (selectedGramsEntry?.discount !== null && selectedGramsEntry?.discount !== undefined) {
            return selectedGramsEntry.discount;
          }
        }
        return product.discount || 0;
      })();

      const productForCart = {
        ...product,
        price: resolvedUnitPrice,
        discount: resolvedDiscount,
      };

      addItem(productForCart, {
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
          packageSize !== null
            ? {
                quantity: quantity,
                packageSize,
                totalUnits: quantity,
              }
            : undefined,
      });
      onClick();
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full space-y-4">
      {sellingType === "package" && normalizedPackageSizes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-rose-900">
            Escolha o tamanho do pacote
          </p>
          <div className="flex flex-wrap gap-2">
            {normalizedPackageSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedPackageSize(size)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                  selectedPackageSize === size
                    ? "border-rose-400 bg-rose-100 text-rose-900"
                    : "border-rose-200 bg-white text-rose-700 hover:border-rose-300"
                }`}
              >
                {size} unidades
              </button>
            ))}
          </div>
        </div>
      )}
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
            : "bg-rose-600 text-white hover:opacity-50"
        }`}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
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
    </div>
  );
};

export default AddToCartButton;
