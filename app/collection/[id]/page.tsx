"use client";

import { use, useEffect, useState } from "react";
import { Product } from "../../types/product";
import { useApi } from "../../hooks/useApi";
import Header from "../../components/header";
import { DisplaySection } from "../../components/dashboard/ProductDisplaySettings";
import { LoadingDots } from "../../components/LoadingDots";
import ProductGrid from "../../components/productGrid";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

export default function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getProducts, getDisplaySettingsById } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<DisplaySection | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        setLoading(true);

        const sectionData = await getDisplaySettingsById(id);

        if (!sectionData) {
          throw new Error("Seção não encontrada");
        }

        const normalizedSection = {
          ...sectionData,
          productIds: sectionData.productIds
            ? typeof sectionData.productIds === "string"
              ? JSON.parse(sectionData.productIds)
              : sectionData.productIds
            : [],
          tags: sectionData.tags
            ? typeof sectionData.tags === "string"
              ? JSON.parse(sectionData.tags)
              : sectionData.tags
            : [],
        };

        setSection(normalizedSection);

        if (
          sectionData.products &&
          Array.isArray(sectionData.products) &&
          sectionData.products.length > 0
        ) {
          const activeProducts = sectionData.products.filter(
            (product: { active: boolean }) => product.active
          );
          setProducts(activeProducts);
          setLoading(false);
          return;
        }

        let sectionProducts: Product[] = [];

        if (
          normalizedSection.type === "category" &&
          normalizedSection.categoryId
        ) {
          sectionProducts = await getProducts({
            categoryId: normalizedSection.categoryId,
            per_page: 100,
          });
        } else if (normalizedSection.type === "custom") {
          const productIds = Array.isArray(normalizedSection.productIds)
            ? normalizedSection.productIds
            : [];

          if (productIds.length > 0) {
            sectionProducts = await getProducts({
              ids: productIds,
              per_page: 100,
            });
          }
        } else if (normalizedSection.type === "discounted") {
          const allProducts = await getProducts({ per_page: 100 });
          if (Array.isArray(allProducts)) {
            sectionProducts = allProducts.filter(
              (p) => p.discount && p.discount > 0
            );
          }
        } else if (normalizedSection.type === "new_arrivals") {
          sectionProducts = await getProducts({
            per_page: 30,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
          <Button
            variant={"link"}
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-8 text-primary"
          >
            <ChevronLeftIcon size={18} />
            <span>Voltar para página inicial</span>
          </Button>
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
      <div className="w-full mt-8 px-8 pb-8 max-w-screen-xl mx-auto">
        <Button
          variant={"link"}
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 text-primary"
        >
          <ChevronLeftIcon size={18} />
          <span>Voltar para página inicial</span>
        </Button>

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
