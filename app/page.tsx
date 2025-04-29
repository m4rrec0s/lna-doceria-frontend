"use client";

import "./globals.css";
import Header from "./components/header";
import { useEffect, useState, useRef, useCallback } from "react";
import { Product } from "./types/product";
import { useApi } from "./hooks/useApi";
import ProductList, { ItemsListSkeleton } from "./components/productList";
import { DisplaySection } from "./components/dashboard/ProductDisplaySettings";
import { BannerPanel } from "./components/bannerPanel";
import { WhatsAppButton } from "./components/whatsappButton";
import { Footer } from "./components/footer";

export default function Home() {
  const { getProducts, getDisplaySettings } = useApi();
  const [displaySections, setDisplaySections] = useState<DisplaySection[]>([]);
  const [visibleSections, setVisibleSections] = useState<DisplaySection[]>([]);
  const [sectionProducts, setSectionProducts] = useState<
    Record<string, Product[]>
  >({});
  const [loadingSections, setLoadingSections] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [hasMoreSections, setHasMoreSections] = useState(true);
  const loadedSectionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingSections(true);
        const settings = await getDisplaySettings();

        if (settings && Array.isArray(settings)) {
          // Filtrar seções ativas e ordenar por ordem
          const activeSettings = settings
            .filter((section) => section.active)
            .sort((a, b) => a.order - b.order)
            .map((section) => {
              // Normalizar os dados para garantir consistência
              return {
                ...section,
                productIds: section.productIds
                  ? typeof section.productIds === "string"
                    ? JSON.parse(section.productIds)
                    : section.productIds
                  : [],
                tags: section.tags
                  ? typeof section.tags === "string"
                    ? JSON.parse(section.tags)
                    : section.tags
                  : [],
                // Incluir produtos pré-carregados se existirem
                products: section.products || [],
              };
            });

          setDisplaySections(activeSettings);

          // Carregar as primeiras seções
          const initialSections = activeSettings.slice(0, 2);
          setVisibleSections(initialSections);
          setHasMoreSections(activeSettings.length > 2);

          // Se as seções já vierem com produtos, usá-los imediatamente
          const initialProducts: Record<string, Product[]> = {};
          initialSections.forEach((section) => {
            if (
              section.products &&
              Array.isArray(section.products) &&
              section.products.length > 0
            ) {
              initialProducts[section.id] = section.products;
              loadedSectionsRef.current.add(section.id);
            }
          });

          if (Object.keys(initialProducts).length > 0) {
            setSectionProducts(initialProducts);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoadingSections(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSectionProducts = useCallback(
    async (sectionsToLoad: DisplaySection[]) => {
      if (!sectionsToLoad.length) return;

      setIsLoadingMore(true);

      const newSectionsData: Record<string, Product[]> = {};
      let hasNewData = false;

      for (const section of sectionsToLoad) {
        // Pular seções que já foram carregadas
        if (loadedSectionsRef.current.has(section.id)) {
          continue;
        }

        // Verificar se a seção já tem produtos pré-carregados
        if (
          section.products &&
          Array.isArray(section.products) &&
          section.products.length > 0
        ) {
          newSectionsData[section.id] = section.products;
          loadedSectionsRef.current.add(section.id);
          hasNewData = true;
          continue;
        }

        // Caso contrário, carregar produtos com base no tipo de seção
        try {
          if (section.type === "category" && section.categoryId) {
            const products = await getProducts({
              categoryId: section.categoryId,
              per_page: 10,
            });
            newSectionsData[section.id] = Array.isArray(products)
              ? products
              : [];
            hasNewData = true;
          } else if (section.type === "discounted") {
            const products = await getProducts({
              per_page: 100,
            });
            newSectionsData[section.id] = Array.isArray(products)
              ? products.filter((p) => p.discount && p.discount > 0)
              : [];
            hasNewData = true;
          } else if (section.type === "custom" && section.productIds) {
            const productIds = Array.isArray(section.productIds)
              ? section.productIds
              : typeof section.productIds === "string"
              ? JSON.parse(section.productIds)
              : [];

            if (productIds.length > 0) {
              const products = await getProducts({
                ids: productIds,
                per_page: 100,
              });
              newSectionsData[section.id] = Array.isArray(products)
                ? products.filter((p) => productIds.includes(p.id))
                : [];
              hasNewData = true;
            }
          } else if (section.type === "new_arrivals") {
            const products = await getProducts({
              per_page: 10,
              // Na API, poderíamos adicionar um parâmetro como "createdAfter"
              // Por enquanto, simplesmente pegamos os mais recentes
            });
            newSectionsData[section.id] = Array.isArray(products)
              ? products
              : [];
            hasNewData = true;
          }

          loadedSectionsRef.current.add(section.id);
        } catch (error) {
          console.error(
            `Erro ao carregar produtos da seção ${section.id}:`,
            error
          );
          newSectionsData[section.id] = [];
          hasNewData = true;
        }
      }

      if (hasNewData) {
        setSectionProducts((prev) => ({ ...prev, ...newSectionsData }));
      }

      setIsLoadingMore(false);
    },
    [getProducts]
  );

  useEffect(() => {
    if (visibleSections.length > 0 && !isLoadingMore) {
      const sectionsToLoad = visibleSections.filter(
        (section) => !loadedSectionsRef.current.has(section.id)
      );

      if (sectionsToLoad.length > 0) {
        loadSectionProducts(sectionsToLoad);
      }
    }
  }, [visibleSections, loadSectionProducts, isLoadingMore]);

  const loadMoreSections = useCallback(() => {
    if (isLoadingMore || !hasMoreSections) return;

    const currentCount = visibleSections.length;
    const nextSections = displaySections.slice(currentCount, currentCount + 2);

    if (nextSections.length > 0) {
      setVisibleSections((prev) => [...prev, ...nextSections]);
      setHasMoreSections(
        currentCount + nextSections.length < displaySections.length
      );
    } else {
      setHasMoreSections(false);
    }
  }, [displaySections, visibleSections, isLoadingMore, hasMoreSections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && hasMoreSections) {
          setTimeout(() => {
            loadMoreSections();
          }, 100);
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMoreSections, isLoadingMore, hasMoreSections]);

  return (
    <main className="w-full overflow-x-hidden">
      <Header />
      <section className="mt-8 mb-6">
        <div className="flex-1">
          <BannerPanel />
        </div>
      </section>

      <div className="space-y-8 pt-4 w-full max-w-screen-xl mx-auto">
        {visibleSections.map((section, index) => (
          <ProductList
            key={`section-${section.id}-${index}`}
            title={section.title}
            products={
              sectionProducts[section.id]?.map((product) => ({
                ...product,
                uniqueKey: `${section.id}-${product.id}`,
              })) || []
            }
            loading={
              loadingSections && !loadedSectionsRef.current.has(section.id)
            }
            error={null}
            sectionId={section.id}
          />
        ))}

        <div
          ref={loadMoreRef}
          className="h-16 w-full flex justify-center items-center"
          style={{
            minHeight: "4rem",
            height: "4rem",
            overflow: "hidden",
          }}
        >
          {isLoadingMore ? (
            <ItemsListSkeleton />
          ) : hasMoreSections ? (
            <div className="h-4 w-full" />
          ) : (
            <div className="text-center text-gray-500 text-sm">
              {!loadingSections && <span></span>}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
