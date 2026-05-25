"use client";

import React, { useEffect, useState } from "react";
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
import { cn } from "@/app/lib/utils";

interface ProductClientProps {
  productId: string;
}

const ProductClient = ({ productId }: ProductClientProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const { ref: cartAnchorRef, inView: cartAnchorInView } = useInView({
    threshold: 0.1,
  });

  const { getProductById, getProducts, getFlavors } = useApi();

  useEffect(() => {
    const fetchProductAndFlavors = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(productId);
        const productItem = Array.isArray(productData.data)
          ? productData.data.find((p: Product) => p.id === productId)
          : productData.data;
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
              flavor && flavor.id
                ? self.findIndex((f) => f.id === flavor.id) === index
                : false,
            );
          setFlavors(Array.isArray(allFlavors) ? allFlavors : []);
        }

        const categoryId = productItem?.categories?.[0]?.id;
        if (categoryId) {
          const related = await getProducts({
            categoryId,
            per_page: 4,
          });
          setRelatedProducts(
            Array.isArray(related)
              ? related.filter((p) => p.id !== productItem.id)
              : [],
          );
        } else {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Erro ao carregar produto ou sabores:", err);
        setError("Não foi possível carregar os detalhes do produto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndFlavors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    setSelectedFlavorIds([]);
  }, [productId]);

  const handleAddToCart = () => {
    console.log(`Adicionando produto ${productId} ao carrinho`);
  };

  const minFlavorSelection = Math.max(0, product?.minFlavors ?? 0);
  const maxFlavorSelection = Math.min(
    flavors.length,
    Math.max(minFlavorSelection, product?.maxFlavors ?? 0),
  );
  const selectedFlavors = flavors.filter((flavor) =>
    selectedFlavorIds.includes(flavor.id),
  );

  const handleToggleFlavor = (flavorId: string, checked: boolean) => {
    setSelectedFlavorIds((prev) => {
      if (checked) {
        if (maxFlavorSelection > 0 && prev.length >= maxFlavorSelection) {
          return prev;
        }
        return [...prev, flavorId];
      }
      return prev.filter((id) => id !== flavorId);
    });
  };

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
    <main className="min-h-screen bg-rose-50/40 pb-16">
      <Header />
      <div className="container mx-auto mt-6 px-4 md:mt-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="w-full max-w-[520px] justify-self-center lg:max-w-[600px] lg:justify-self-start">
            <ProductGallery imageUrl={product?.imageUrl} alt={product?.name} />
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-rose-100 bg-white p-6">
              <ProductInfo
                name={product?.name}
                price={product?.price}
                description={product?.description || "Sem descrição disponível"}
                categories={product?.categories}
                discount={product?.discount}
              />
            </div>

            {flavors.length > 0 && (
              <div className="rounded-[28px] border border-rose-100 bg-white p-6">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <h2 className="text-lg font-semibold text-rose-950">
                    Escolha seus sabores
                  </h2>
                  <span className="text-xs font-medium text-zinc-600">
                    Selecionados: {selectedFlavorIds.length}
                    {maxFlavorSelection > 0 ? `/${maxFlavorSelection}` : ""}
                  </span>
                </div>
                {maxFlavorSelection > 0 && (
                  <p className="mb-4 rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    Selecione entre {minFlavorSelection} e {maxFlavorSelection} sabores.
                  </p>
                )}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {flavors.map((flavor) => (
                    <label
                      key={flavor.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 transition-colors",
                        selectedFlavorIds.includes(flavor.id)
                          ? "border-rose-400 bg-rose-100"
                          : "border-rose-100 bg-white hover:border-rose-300",
                      )}
                    >
                      <Checkbox
                        checked={selectedFlavorIds.includes(flavor.id)}
                        onCheckedChange={(checked) =>
                          handleToggleFlavor(flavor.id, checked === true)
                        }
                        disabled={
                          !selectedFlavorIds.includes(flavor.id) &&
                          maxFlavorSelection > 0 &&
                          selectedFlavorIds.length >= maxFlavorSelection
                        }
                        className="border-rose-400 data-[state=checked]:bg-rose-400 data-[state=checked]:text-rose-950"
                      />
                      {flavor.imageUrl && (
                        <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-rose-200">
                          <Image
                            src={flavor.imageUrl}
                            alt={flavor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium text-zinc-800">
                        {flavor.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div ref={cartAnchorRef} className="rounded-[28px] border border-rose-100 bg-white p-6">
              <AddToCartButton
                onClick={handleAddToCart}
                product={product}
                selectedFlavors={selectedFlavors}
                minFlavors={maxFlavorSelection > 0 ? minFlavorSelection : 0}
                maxFlavors={maxFlavorSelection}
                disabled={
                  maxFlavorSelection > 0 &&
                  selectedFlavorIds.length < minFlavorSelection
                }
              />
            </div>

            {relatedProducts.length > 0 && (
              <div className="rounded-[28px] border border-rose-100 bg-white p-6">
                <RelatedProducts products={relatedProducts} />
              </div>
            )}
          </div>
        </div>
      </div>

      {!cartAnchorInView && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-rose-100 bg-white/95 p-4 backdrop-blur lg:hidden">
          <AddToCartButton
            onClick={handleAddToCart}
            product={product}
            selectedFlavors={selectedFlavors}
            minFlavors={maxFlavorSelection > 0 ? minFlavorSelection : 0}
            maxFlavors={maxFlavorSelection}
            disabled={
              maxFlavorSelection > 0 &&
              selectedFlavorIds.length < minFlavorSelection
            }
          />
        </div>
      )}
    </main>
  );
};

export default ProductClient;
