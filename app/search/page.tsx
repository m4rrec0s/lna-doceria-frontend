/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApi } from "../hooks/useApi";
import { Product } from "../types/product";
import { Category } from "../types/category";
import Header from "../components/header";
import { Badge } from "../components/ui/badge";
import ProductGrid from "../components/productGrid";
import LoadingDots from "../components/LoadingDots";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { getProducts, getCategories } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true);
      const query = searchParams.get("q");
      const products = await getProducts({
        name: query || undefined,
        categoryId: selectedCategory || undefined,
        per_page: 50,
      });
      setProducts(Array.isArray(products) ? products : []);
      setLoading(false);
    };
    searchProducts();
  }, [searchParams, selectedCategory]);

  return (
    <main className="min-h-screen">
      <Header showSearch />
      <div className="container mx-auto pt-[120px] px-4">
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge
            variant={!selectedCategory ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory("")}
          >
            Todas
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
        <div className="w-full">
          {loading ? (
            <LoadingDots title="Carregando produtos..." />
          ) : (
            <div className="my-6 flex flex-col justify-center items-center gap-3">
              <h2 className="text-2xl">
                <strong>Resultado</strong> para a pesquisa
              </h2>
              <ProductGrid products={products} />
            </div>
          )}

          {products.length === 0 && !loading && (
            <div className="flex justify-center items-center h-[200px]">
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
