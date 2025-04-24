"use client";

import "./globals.css";
import Header from "./components/header";
import { useEffect, useState, useRef, useCallback } from "react";
import { Product } from "./types/product";
import { useApi } from "./hooks/useApi";
import ProductList, { ItemsListSkeleton } from "./components/productList";
import { ProductSection } from "./components/dashboard/ProductDisplaySettings";
import { BannerPanel } from "./components/bannerPanel";
import { WhatsAppButton } from "./components/whatsappButton";
import { Footer } from "./components/footer";

export default function Home() {
  const { getProducts, getDisplaySettings } = useApi();
  const [displaySections, setDisplaySections] = useState<ProductSection[]>([]);
  const [visibleSections, setVisibleSections] = useState<ProductSection[]>([]);
  const [sectionProducts, setSectionProducts] = useState<
    Record<string, Product[]>
  >({});
  const [loadingSections, setLoadingSections] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [hasMoreSections, setHasMoreSections] = useState(true);
  const loadedSectionsRef = useRef<Set<string>>(new Set());

  // const bannerData: {
  //   imageUrl: string;
  //   title: string;
  //   description: string;
  //   categoryId: string;
  //   variant: "blue" | "green" | "pink" | "purple" | "default";
  //   brightness?: boolean;
  // }[] = [
  //   {
  //     imageUrl:
  //       "https://i.pinimg.com/736x/a5/95/58/a59558852b2b2e3fb7d663c553b1c8af.jpg",
  //     title: "Doces especiais",
  //     description: "Ovos recheados",
  //     categoryId: "Ovos de colher",
  //     variant: "purple",
  //     brightness: true,
  //   },
  //   {
  //     imageUrl:
  //       "https://i.pinimg.com/736x/fc/a3/c6/fca3c64968a6ebc312bbb3942c11f661.jpg",
  //     title: "Trufas",
  //     description: "As melhores",
  //     categoryId: "Trufas finas",
  //     variant: "blue",
  //     brightness: true,
  //   },
  //   {
  //     imageUrl:
  //       "https://i.pinimg.com/736x/a1/41/fd/a141fde1a2310071782378d1bdca8bdd.jpg",
  //     title: "Especiais",
  //     description: "Aqui temos os melhores",
  //     categoryId: "Cento brigadeiro especiais",
  //     variant: "purple",
  //     brightness: true,
  //   },
  //   {
  //     imageUrl:
  //       "https://i.pinimg.com/736x/d4/81/9e/d4819e2518d3cb34d5e0c966a77d6984.jpg",
  //     title: "Tradicionais",
  //     description: "Melhores Brigadeiros",
  //     categoryId: "Cento de brigadeiro tradicional",
  //     variant: "pink",
  //     brightness: true,
  //   },
  // ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const settings = await getDisplaySettings();
        if (settings && Array.isArray(settings)) {
          const activeSettings = settings
            .filter((section) => section.active)
            .map((section) => ({
              ...section,
              productIds:
                section.productIds && typeof section.productIds === "string"
                  ? JSON.parse(section.productIds)
                  : [],
              tags:
                section.tags && typeof section.tags === "string"
                  ? JSON.parse(section.tags)
                  : [],
            }));
          setDisplaySections(activeSettings);

          const initialSections = activeSettings.slice(0, 2);
          setVisibleSections(initialSections);
          setHasMoreSections(activeSettings.length > 2);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSectionProducts = useCallback(
    async (sectionsToLoad: ProductSection[]) => {
      if (!sectionsToLoad.length) return;

      setIsLoadingMore(true);

      const newSectionsData: Record<string, Product[]> = {};
      let hasNewData = false;

      for (const section of sectionsToLoad) {
        if (loadedSectionsRef.current.has(section.id)) {
          continue;
        }

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
            const productIds =
              typeof section.productIds === "string"
                ? JSON.parse(section.productIds)
                : section.productIds;

            if (Array.isArray(productIds) && productIds.length > 0) {
              const products = await getProducts({
                ids: productIds,
                per_page: 100,
              });
              newSectionsData[section.id] = Array.isArray(products)
                ? products.filter((p) => productIds.includes(p.id))
                : [];
              hasNewData = true;
            }
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

      setLoadingSections(false);
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
        {visibleSections.map((section) => (
          <ProductList
            key={section.id}
            title={section.title}
            products={sectionProducts[section.id] || []}
            loading={loadingSections && !sectionProducts[section.id]}
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
