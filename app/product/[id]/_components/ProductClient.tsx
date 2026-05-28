"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApi } from "../../../hooks/useApi";
import { useInView } from "react-intersection-observer";
import { Product } from "../../../types/product";
import { Flavor } from "../../../types/flavor";
import Header from "../../../components/header";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import AddToCartButton from "./AddToCartButton";
import RelatedProducts from "./RelatedProducts";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/app/types/category";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/lib/utils";
import { ChevronRight, Search, X } from "lucide-react";
import { formatCurrency } from "@/app/utils/format";
import { motion, AnimatePresence } from "framer-motion";

interface ProductClientProps {
  productId: string;
}

interface FlavorDrawerProps {
  open: boolean;
  onClose: () => void;
  flavors: Flavor[];
  selectedFlavorIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  minFlavors: number;
  maxFlavors: number;
}

const FlavorDrawer = ({
  open,
  onClose,
  flavors,
  selectedFlavorIds,
  onToggle,
  minFlavors,
  maxFlavors,
}: FlavorDrawerProps) => {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSearch("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = search.trim()
    ? flavors.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : flavors;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />

          {/* Bottom sheet — mobile */}
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[82svh] flex-col rounded-t-3xl bg-white shadow-2xl lg:hidden"
          >
            <DrawerContent
              inputRef={inputRef}
              flavors={flavors}
              filtered={filtered}
              search={search}
              setSearch={setSearch}
              selectedFlavorIds={selectedFlavorIds}
              onToggle={onToggle}
              minFlavors={minFlavors}
              maxFlavors={maxFlavors}
              onClose={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Conteúdo compartilhado entre drawer (mobile) e painel inline (desktop)
interface DrawerContentProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  flavors: Flavor[];
  filtered: Flavor[];
  search: string;
  setSearch: (v: string) => void;
  selectedFlavorIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  minFlavors: number;
  maxFlavors: number;
  onClose?: () => void;
  inline?: boolean;
}

const DrawerContent = ({
  inputRef,
  flavors,
  filtered,
  search,
  setSearch,
  selectedFlavorIds,
  onToggle,
  minFlavors,
  maxFlavors,
  onClose,
  inline = false,
}: DrawerContentProps) => (
  <>
    {/* Handle + cabeçalho */}
    <div className={cn("flex-none px-5", inline ? "pt-0" : "pt-3")}>
      {!inline && (
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-200" />
      )}
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="text-base font-bold text-rose-950">
            Escolha seus sabores
          </h3>
          {maxFlavors > 0 && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {selectedFlavorIds.length} sabor{selectedFlavorIds.length > 1 ? "es" : ""} selecionado{selectedFlavorIds.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {onClose && !inline && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {maxFlavors > 0 && (
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-rose-100">
          <motion.div
            className="h-full rounded-full bg-rose-500"
            animate={{
              width: `${Math.min(100, (selectedFlavorIds.length / maxFlavors) * 100)}%`,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
      )}

      {maxFlavors > 0 && minFlavors > 0 && (
        <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
          Selecione entre {minFlavors} e {maxFlavors} sabores
        </p>
      )}

      {flavors.length > 6 && (
        <div className="relative mb-3">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar sabor..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>
      )}
    </div>

    <div className="flex-1 overflow-y-auto px-5 pb-6">
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">
          Nenhum sabor encontrado
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filtered.map((flavor) => {
            const isSelected = selectedFlavorIds.includes(flavor.id);
            const isDisabled =
              !isSelected &&
              maxFlavors > 0 &&
              selectedFlavorIds.length >= maxFlavors;

            return (
              <motion.label
                key={flavor.id}
                layout
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors",
                  isSelected
                    ? "border-rose-400 bg-rose-50"
                    : isDisabled
                      ? "cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-50"
                      : "border-zinc-100 bg-white hover:border-rose-200 hover:bg-rose-50/40",
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onToggle(flavor.id, checked === true)
                  }
                  disabled={isDisabled}
                  className="border-rose-300 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                />
                {flavor.imageUrl && (
                  <div className="relative h-9 w-9 flex-none overflow-hidden rounded-full border border-rose-100">
                    <Image
                      src={flavor.imageUrl}
                      alt={flavor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-rose-900" : "text-zinc-700",
                  )}
                >
                  {flavor.name}
                </span>
                {isSelected && (
                  <span className="ml-auto flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {selectedFlavorIds.indexOf(flavor.id) + 1}
                  </span>
                )}
              </motion.label>
            );
          })}
        </div>
      )}
    </div>

    {onClose && !inline && (
      <div className="flex-none border-t border-zinc-100 p-4">
        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-rose-600 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          {selectedFlavorIds.length === 0
            ? "Confirmar sem sabores"
            : `Confirmar ${selectedFlavorIds.length} sabor${selectedFlavorIds.length > 1 ? "es" : ""}`}
        </button>
      </div>
    )}
  </>
);

// ---------------------------------------------------------------------------
const ProductClient = ({ productId }: ProductClientProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const [flavorDrawerOpen, setFlavorDrawerOpen] = useState(false);
  const [selectedGram, setSelectedGram] = useState<number | null>(null);
  const [selectedPackageSize, setSelectedPackageSize] = useState<number | null>(
    null,
  );
  const [useSpecificQuantity, setUseSpecificQuantity] = useState(false);
  const [specificQuantity, setSpecificQuantity] = useState(1);
  const [desktopSearch, setDesktopSearch] = useState("");
  const initProductRef = useRef<string | null>(null);

  const { ref: cartAnchorRef, inView: cartAnchorInView } = useInView({
    threshold: 0.1,
  });

  const { getProductById, getProducts, getFlavors } = useApi();

  useEffect(() => {
    const fetchProductAndFlavors = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(productId);
        const productItem = Array.isArray(productData)
          ? productData.find((p: Product) => p.id === productId)
          : productData;
        setProduct(productItem);

        if (productItem?.categories && productItem.categories.length > 0) {
          const categoryIds = productItem.categories.map(
            (cat: Category) => cat.id,
          );
          const allFlavorsArrays = await Promise.all(
            categoryIds.map((id: string) => getFlavors({ categoryId: id })),
          );
          const allFlavors = allFlavorsArrays
            .flat()
            .filter((flavor, index, self) =>
              flavor?.id
                ? self.findIndex((f) => f.id === flavor.id) === index
                : false,
            );
          setFlavors(Array.isArray(allFlavors) ? allFlavors : []);
        }

        const categoryId = productItem?.categories?.[0]?.id;
        if (categoryId) {
          const related = await getProducts({ categoryId, per_page: 4 });
          setRelatedProducts(
            Array.isArray(related)
              ? related.filter((p) => p.id !== productItem.id)
              : [],
          );
        } else {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
        setError("Não foi possível carregar os detalhes do produto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndFlavors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    if (initProductRef.current === productId) return;
    initProductRef.current = productId;

    setSelectedFlavorIds([]);
    setFlavorDrawerOpen(false);
    
    if (product?.packagePrices) {
      try {
        const packages = Array.isArray(product.packagePrices)
          ? product.packagePrices
          : JSON.parse(product.packagePrices);
        if (Array.isArray(packages) && packages.length > 0) {
          const sorted = packages
            .map((entry) => ({ quantity: Number(entry.quantity) }))
            .filter((entry) => Number.isFinite(entry.quantity) && entry.quantity > 0)
            .sort((a, b) => b.quantity - a.quantity);
          setSelectedPackageSize(sorted.length > 0 ? sorted[0].quantity : null);
        } else {
          setSelectedPackageSize(null);
        }
      } catch {
        setSelectedPackageSize(null);
      }
    } else {
      setSelectedPackageSize(null);
    }
    
    if (product?.gramsPrices) {
      try {
        const grams = Array.isArray(product.gramsPrices)
          ? product.gramsPrices
          : JSON.parse(product.gramsPrices);
        if (Array.isArray(grams) && grams.length > 0) {
          const sorted = grams
            .map((entry) => ({ quantity: Number(entry.quantity) }))
            .filter((entry) => Number.isFinite(entry.quantity) && entry.quantity > 0)
            .sort((a, b) => b.quantity - a.quantity);
          setSelectedGram(sorted.length > 0 ? sorted[0].quantity : null);
        } else {
          setSelectedGram(null);
        }
      } catch {
        setSelectedGram(null);
      }
    } else {
      setSelectedGram(null);
    }
    
    setDesktopSearch("");
  }, [productId, product]);

  const dynamicPricing = useMemo(() => {
    if (!product) return { price: 0, discount: 0 };
    const basePrice = Number(product.price || 0);
    const baseDiscount = Number(product.discount || 0);

    const normalizedPackagePrices = Array.isArray(product.packagePrices)
      ? product.packagePrices
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
              entry.price >= 0,
          )
          .sort((a, b) => a.quantity - b.quantity)
      : [];

    if (normalizedPackagePrices.length > 0) {
      const selected =
        normalizedPackagePrices.find(
          (entry) => entry.quantity === selectedPackageSize,
        ) || normalizedPackagePrices[normalizedPackagePrices.length - 1];
      return {
        price: selected?.price ?? basePrice,
        discount:
          selected?.discount === null || selected?.discount === undefined
            ? baseDiscount
            : selected.discount,
      };
    }

    const normalizedGramsPrices = Array.isArray(product.gramsPrices)
      ? product.gramsPrices
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
              entry.price >= 0,
          )
          .sort((a, b) => b.quantity - a.quantity)
      : [];

    if (selectedGram !== null && normalizedGramsPrices.length > 0) {
      const selected = normalizedGramsPrices.find(
        (entry) => entry.quantity === selectedGram,
      );
      if (selected) {
        return {
          price: selected.price,
          discount:
            selected.discount === null || selected.discount === undefined
              ? baseDiscount
              : selected.discount,
        };
      }
    }

    return { price: basePrice, discount: baseDiscount };
  }, [product, selectedGram, selectedPackageSize]);

  const handleAddToCart = () => {
    console.log(`Adicionando produto ${productId} ao carrinho`);
  };

  const minFlavorSelection = Math.max(0, product?.minFlavors ?? 0);
  const maxFlavorSelection = Math.min(
    flavors.length,
    Math.max(minFlavorSelection, product?.maxFlavors ?? 0),
  );
  const selectedFlavors = flavors.filter((f) =>
    selectedFlavorIds.includes(f.id),
  );

  const handleToggleFlavor = (flavorId: string, checked: boolean) => {
    setSelectedFlavorIds((prev) => {
      if (checked) {
        if (maxFlavorSelection > 0 && prev.length >= maxFlavorSelection)
          return prev;
        return [...prev, flavorId];
      }
      return prev.filter((id) => id !== flavorId);
    });
  };

  const desktopFiltered = desktopSearch.trim()
    ? flavors.filter((f) =>
        f.name.toLowerCase().includes(desktopSearch.toLowerCase()),
      )
    : flavors;



  if (loading) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 mt-8 py-12 flex justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-rose-300 border-t-transparent animate-spin" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 mt-8 py-12">
          <div className="text-center">
            <span className="text-6xl mb-4 block">😕</span>
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <p className="text-gray-600 mb-6">
              {error || "Este produto não está disponível ou não existe."}
            </p>
            <Link href="/">
              <button className="bg-rose-300 text-rose-950 py-2 px-6 rounded-full">
                Voltar para a página inicial
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-rose-50/40 pb-32 lg:pb-16">
      <Header />

      <div className="max-w-7xl mx-auto mt-4 px-4 sm:mt-6 md:mt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="w-full max-w-[540px] justify-self-center lg:max-w-[600px] lg:sticky lg:top-6 lg:self-start lg:justify-self-start">
            <ProductGallery
              imageUrl={product?.imageUrl}
              imageUrls={product?.imageUrls}
              alt={product?.name}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-rose-100 bg-white p-5 sm:p-6">
              <ProductInfo
                name={product?.name}
                price={dynamicPricing.price}
                description={product?.description || "Sem descrição disponível"}
                categories={product?.categories}
                discount={dynamicPricing.discount}
              />
            </div>

            {Array.isArray(product.gramsOptions) &&
              product.gramsOptions.length > 0 && (
                <div className="rounded-3xl border border-rose-100 bg-white p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-rose-800">
                    Escolha o peso
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[...product.gramsOptions].sort((a, b) => b - a).map((grams) => (
                      <button
                        key={grams}
                        type="button"
                        onClick={() =>
                          setSelectedGram(grams === selectedGram ? null : grams)
                        }
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                          selectedGram === grams
                            ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                            : "border-rose-200 bg-white text-rose-700 hover:border-rose-300"
                        }`}
                      >
                        {grams}g
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {product.unitMinQuantity && product.price > 0 && (
              <div className="rounded-3xl border border-rose-100 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
                    Quantidade específica
                  </p>
                  {!useSpecificQuantity && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseSpecificQuantity(true);
                        setSpecificQuantity(product.unitMinQuantity ?? 1);
                        setSelectedPackageSize(null);
                        setSelectedGram(null);
                      }}
                      className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition"
                    >
                      + Especificar
                    </button>
                  )}
                </div>
                {useSpecificQuantity && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min={product.unitMinQuantity ?? 1}
                          max={product.unitMaxQuantity ?? undefined}
                          value={specificQuantity}
                          onChange={(e) => {
                            setSpecificQuantity(Number(e.target.value));
                          }}
                          onBlur={() => {
                            const min = product.unitMinQuantity ?? 1;
                            const max = product.unitMaxQuantity;
                            let adjusted = specificQuantity;
                            if (adjusted < min) adjusted = min;
                            if (max !== null && max !== undefined && adjusted > max) adjusted = max;
                            setSpecificQuantity(adjusted);
                          }}
                          className="rounded-2xl h-11 border-zinc-200 focus:border-amber-400 focus:ring-amber-100 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseSpecificQuantity(false)}
                        className="text-xs text-zinc-500 hover:text-zinc-700 font-semibold px-3 py-1.5"
                      >
                        Cancelar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-amber-50 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full text-amber-700 font-semibold">
                        Mín: {product.unitMinQuantity} unid.
                      </span>
                      {product.unitMaxQuantity && (
                        <span className="bg-amber-50 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full text-amber-700 font-semibold">
                          Máx: {product.unitMaxQuantity} unid.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {useSpecificQuantity && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                    Valor total
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {specificQuantity} {specificQuantity === 1 ? "unidade" : "unidades"} × R$ {Number(product.price).toFixed(2)}
                  </p>
                </div>
                <span className="text-xl font-bold text-amber-900">
                  {formatCurrency(Number(product.price) * specificQuantity)}
                </span>
              </div>
            )}

            {flavors.length > 0 && (
              <div className="rounded-3xl border border-rose-100 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFlavorDrawerOpen(true)}
                  className="flex w-full items-center justify-between p-5 text-left lg:hidden"
                >
                  <div>
                    <p className="text-sm font-bold text-rose-950">
                      Escolha seus sabores
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {selectedFlavorIds.length > 0
                        ? `${selectedFlavorIds.length} sabor${selectedFlavorIds.length > 1 ? "es" : ""} selecionado${selectedFlavorIds.length > 1 ? "s" : ""}`
                        : maxFlavorSelection > 0
                          ? `Selecione de ${minFlavorSelection} a ${maxFlavorSelection}`
                          : `${flavors.length} opções disponíveis`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedFlavorIds.length > 0 && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                        {selectedFlavorIds.length}
                      </span>
                    )}
                    <ChevronRight size={18} className="text-zinc-400" />
                  </div>
                </button>

                {selectedFlavorIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-5 pb-4 lg:hidden">
                    {selectedFlavors.map((f, i) => (
                      <span
                        key={f.id}
                        className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs text-rose-800"
                      >
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-400 text-[7px] text-white font-bold">
                          {i + 1}
                        </span>
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="hidden lg:block p-5 pt-0">
                  <div className="flex items-center justify-between pb-4 pt-5">
                    <div>
                      <p className="text-sm font-bold text-rose-950">
                        Escolha seus sabores
                      </p>
                      {maxFlavorSelection > 0 && (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {selectedFlavorIds.length} sabor{selectedFlavorIds.length > 1 ? "es" : ""} selecionado{selectedFlavorIds.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  {maxFlavorSelection > 0 && (
                    <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-rose-100">
                      <motion.div
                        className="h-full rounded-full bg-rose-500"
                        animate={{
                          width: `${Math.min(100, (selectedFlavorIds.length / maxFlavorSelection) * 100)}%`,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 25,
                        }}
                      />
                    </div>
                  )}

                  {maxFlavorSelection > 0 && minFlavorSelection > 0 && (
                    <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      Selecione entre {minFlavorSelection} e{" "}
                      {maxFlavorSelection} sabores
                    </p>
                  )}

                  {flavors.length > 6 && (
                    <div className="relative mb-3">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="text"
                        value={desktopSearch}
                        onChange={(e) => setDesktopSearch(e.target.value)}
                        placeholder="Buscar sabor..."
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-rose-200">
                    {desktopFiltered.map((flavor) => {
                      const isSelected = selectedFlavorIds.includes(flavor.id);
                      const isDisabled =
                        !isSelected &&
                        maxFlavorSelection > 0 &&
                        selectedFlavorIds.length >= maxFlavorSelection;

                      return (
                        <label
                          key={flavor.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors",
                            isSelected
                              ? "border-rose-400 bg-rose-50"
                              : isDisabled
                                ? "cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-50"
                                : "border-zinc-100 bg-white hover:border-rose-200 hover:bg-rose-50/40",
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleToggleFlavor(flavor.id, checked === true)
                            }
                            disabled={isDisabled}
                            className="border-rose-300 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                          />
                          {flavor.imageUrl && (
                            <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full border border-rose-100">
                              <Image
                                src={flavor.imageUrl}
                                alt={flavor.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-rose-900" : "text-zinc-700",
                            )}
                          >
                            {flavor.name}
                          </span>
                          {isSelected && (
                            <span className="ml-auto flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                              {selectedFlavorIds.indexOf(flavor.id) + 1}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div
              ref={cartAnchorRef}
              className="rounded-3xl border border-rose-100 bg-white p-5"
            >
              <AddToCartButton
                onClick={handleAddToCart}
                product={product}
                selectedFlavors={selectedFlavors}
                minFlavors={maxFlavorSelection > 0 ? minFlavorSelection : 0}
                maxFlavors={maxFlavorSelection}
                selectedGram={selectedGram}
                selectedPackageSize={selectedPackageSize}
                onSelectedPackageSizeChange={(size) => {
                  setSelectedPackageSize(size);
                  if (size !== null) setUseSpecificQuantity(false);
                }}
                useSpecificQuantity={useSpecificQuantity}
                specificQuantity={specificQuantity}
                disabled={
                  maxFlavorSelection > 0 &&
                  selectedFlavorIds.length < minFlavorSelection
                }
              />
            </div>
          </div>
        </div>
        {relatedProducts.length > 0 && (
          <div className="rounded-3xl border border-rose-100 bg-white p-5 my-4">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {!cartAnchorInView && (
          <motion.div
            key="sticky-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-rose-100 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden"
          >
            {flavors.length > 0 &&
            selectedFlavorIds.length < minFlavorSelection ? (
              <button
                onClick={() => setFlavorDrawerOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-100 py-3.5 text-sm font-semibold text-rose-700"
              >
                Escolha seus sabores ({selectedFlavorIds.length}/
                {maxFlavorSelection})
              </button>
            ) : (
              <AddToCartButton
                onClick={handleAddToCart}
                product={product}
                selectedFlavors={selectedFlavors}
                minFlavors={maxFlavorSelection > 0 ? minFlavorSelection : 0}
                maxFlavors={maxFlavorSelection}
                selectedGram={selectedGram}
                selectedPackageSize={selectedPackageSize}
                onSelectedPackageSizeChange={(size) => {
                  setSelectedPackageSize(size);
                  if (size !== null) setUseSpecificQuantity(false);
                }}
                useSpecificQuantity={useSpecificQuantity}
                specificQuantity={specificQuantity}
                disabled={
                  maxFlavorSelection > 0 &&
                  selectedFlavorIds.length < minFlavorSelection
                }
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <FlavorDrawer
        open={flavorDrawerOpen}
        onClose={() => setFlavorDrawerOpen(false)}
        flavors={flavors}
        selectedFlavorIds={selectedFlavorIds}
        onToggle={handleToggleFlavor}
        minFlavors={minFlavorSelection}
        maxFlavors={maxFlavorSelection}
      />
    </main>
  );
};

export default ProductClient;
