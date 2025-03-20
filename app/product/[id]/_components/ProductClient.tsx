"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApi } from "../../../hooks/useApi";
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

interface ProductClientProps {
  productId: string;
}

const ProductClient = ({ productId }: ProductClientProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { getProductById, getProducts, getFlavors } = useApi();

  const getCategoryMessage = (product: Product) => {
    if (!product.categories || !Array.isArray(product.categories)) return null;
  };

  useEffect(() => {
    const fetchProductAndFlavors = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(productId);
        const productItem = Array.isArray(productData.data)
          ? productData.data[0]
          : productData.data;
        setProduct(productItem);

        if (productItem?.categories && productItem.categories.length > 0) {
          const categoryIds = productItem.categories.map(
            (cat: Category) => cat.id
          );
          const flavorData = await getFlavors({ categoryId: categoryIds[0] });
          setFlavors(Array.isArray(flavorData) ? flavorData : []);
        }

        if (productItem?.category_id) {
          const related = await getProducts({
            categoryId: productItem.category_id,
            per_page: 4,
          });
          setRelatedProducts(
            Array.isArray(related)
              ? related.filter((p) => p.id !== productItem.id)
              : []
          );
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

  const handleAddToCart = () => {
    console.log(`Adicionando produto ${productId} ao carrinho`);
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 mt-[100px] py-12 flex justify-center">
          <motion.div
            className="w-20 h-20 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 mt-[100px] py-12">
          <div className="text-center">
            <span className="text-6xl mb-4 block">😕</span>
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <p className="text-gray-600 mb-6">
              {error || "Este produto não está disponível ou não existe."}
            </p>
            <Link href="/">
              <motion.button
                className="bg-pink-500 text-white py-2 px-6 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Voltar para a página inicial
              </motion.button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-[150px]">
      <Header />
      <div className="container mx-auto px-4 mt-[100px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductGallery imageUrl={product?.imageUrl} alt={product?.name} />

          <div>
            <ProductInfo
              name={product?.name}
              price={product?.price}
              description={product?.description || "Sem descrição disponível"}
              categories={product?.categories}
            />

            {/* Seção de Sabores */}
            {flavors.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">
                  Sabores Disponíveis
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {flavors.map((flavor) => (
                    <div
                      key={flavor.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-background"
                    >
                      {flavor.imageUrl && (
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={flavor.imageUrl}
                            alt={flavor.name}
                            fill
                            className="object-cover rounded-full"
                          />
                        </div>
                      )}
                      <span className="text-gray-700">{flavor.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-[150px]">
              {product && getCategoryMessage(product)}
            </div>

            <div className="py-6 fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-2xl rounded-tl-lg rounded-tr-lg border-gray-100 z-50">
              {product && (
                <AddToCartButton onClick={handleAddToCart} product={product} />
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    </main>
  );
};

export default ProductClient;
