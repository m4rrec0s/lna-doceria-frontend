/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import { Product } from "../../types/product";
import { useApi } from "../../hooks/useApi";
import Header from "../../components/header";
import { ProductSection } from "../../components/dashboard/ProductDisplaySettings";
import { LoadingDots } from "../../components/LoadingDots";
import ProductGrid from "../../components/productGrid";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

export default function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getProducts, getDisplaySettings } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<ProductSection | null>(null);

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        setLoading(true);
        // Obter configurações de exibição
        const settings = await getDisplaySettings();
        if (!Array.isArray(settings)) {
          throw new Error("Formato de configuração inválido");
        }

        // Encontrar a seção específica
        const targetSection = settings.find((section) => section.id === id);
        if (!targetSection) {
          throw new Error("Seção não encontrada");
        }

        setSection(targetSection);

        // Carregar produtos com base no tipo de seção
        let sectionProducts: Product[] = [];
        if (targetSection.type === "category" && targetSection.categoryId) {
          // Buscar produtos da categoria, sem limite de quantidade
          sectionProducts = await getProducts({
            categoryId: targetSection.categoryId,
            per_page: 100,
          });
        } else if (
          (targetSection.type === "custom" ||
            targetSection.type === "featured") &&
          targetSection.productIds?.length
        ) {
          // Buscar produtos específicos por IDs
          sectionProducts = await getProducts({
            ids: targetSection.productIds,
            per_page: 100,
          });
        }

        setProducts(Array.isArray(sectionProducts) ? sectionProducts : []);
      } catch (err) {
        console.error("Erro ao carregar dados da seção:", err);
        setError((err as Error).message || "Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="w-full flex-1 flex justify-center">
          <LoadingDots />
        </div>
      </>
    );
  }

  if (error || !section) {
    return (
      <>
        <Header />
        <div className="w-full mt-8 px-4 max-w-screen-xl mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-8 text-primary">
            <ChevronLeftIcon size={18} />
            <span>Voltar para página inicial</span>
          </Link>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
            <h1 className="text-xl font-medium text-red-800">
              Erro ao carregar produtos
            </h1>
            <p className="text-red-600 mt-2">
              {error || "Seção não encontrada"}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="w-full mt-8 px-4 max-w-screen-xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 text-primary">
          <ChevronLeftIcon size={18} />
          <span>Voltar para página inicial</span>
        </Link>

        <h1 className="text-3xl font-bold mb-8">{section.title}</h1>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="w-full p-10 text-center border rounded-lg bg-gray-50">
            <p className="text-gray-500">
              Nenhum produto encontrado nesta coleção.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
