/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import "./globals.css";
import Header from "./components/header";
import { useEffect, useState, useRef, useCallback } from "react";
import { Product } from "./types/product";
import { useApi } from "./hooks/useApi";
import { motion } from "framer-motion";
import { fadeInUp } from "./utils/animations";
import ProductList from "./components/productList";
import { ProductSection } from "./components/dashboard/ProductDisplaySettings";
import BannerContainer from "./components/bannerContainer";
import Link from "next/link";
import LoadingDots from "./components/LoadingDots";

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

  const bannerData: {
    imageUrl: string;
    title: string;
    description: string;
    categoryId: string;
    variant: "blue" | "green" | "pink" | "purple" | "default";
    brightness?: boolean;
  }[] = [
    {
      imageUrl:
        "https://i.pinimg.com/736x/a5/95/58/a59558852b2b2e3fb7d663c553b1c8af.jpg",
      title: "Doces especiais",
      description: "Ovos recheados",
      categoryId: "Ovos de colher",
      variant: "purple",
      brightness: true,
    },
    {
      imageUrl:
        "https://i.pinimg.com/736x/fc/a3/c6/fca3c64968a6ebc312bbb3942c11f661.jpg",
      title: "Trufas",
      description: "As melhores",
      categoryId: "Trufas finas",
      variant: "blue",
      brightness: true,
    },
    {
      imageUrl:
        "https://i.pinimg.com/736x/a1/41/fd/a141fde1a2310071782378d1bdca8bdd.jpg",
      title: "Especiais",
      description: "Aqui temos os melhores",
      categoryId: "Cento brigadeiro especiais",
      variant: "purple",
      brightness: true,
    },
    {
      imageUrl:
        "https://i.pinimg.com/736x/d4/81/9e/d4819e2518d3cb34d5e0c966a77d6984.jpg",
      title: "Tradicionais",
      description: "Melhores Brigadeiros",
      categoryId: "Cento de brigadeiro tradicional",
      variant: "pink",
      brightness: true,
    },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const settings = await getDisplaySettings();
        if (settings && Array.isArray(settings)) {
          const activeSettings = settings.filter((section) => section.active);
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
          } else if (
            (section.type === "custom" || section.type === "featured") &&
            section.productIds?.length
          ) {
            const products = await getProducts({
              ids: section.productIds,
              per_page: 100,
            });
            newSectionsData[section.id] = Array.isArray(products)
              ? products.filter((p) => section.productIds?.includes(p.id))
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
      <section className="mt-[100px]">
        <div className="px-8">
          <motion.div
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.3,
                },
              },
            }}
          >
            <motion.h1
              className="text-3xl md:text-4xl font-light mb-2"
              variants={fadeInUp}
            >
              Conheça nossos
            </motion.h1>
            <motion.h2
              className="text-3xl md:text-4xl font-bold flex items-center gap-2"
              variants={fadeInUp}
            >
              Deliciosos Doces
            </motion.h2>
          </motion.div>

          <motion.div>
            <BannerContainer banners={bannerData} />
          </motion.div>
        </div>
      </section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 mb-10 flex justify-center"
      >
        <Link
          href="https://wa.me/558388511950/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
          Fale conosco pelo WhatsApp
        </Link>
      </motion.div>

      <div className="space-y-8 py-8 w-full max-w-screen-xl mx-auto">
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
            <LoadingDots title="Carregando mais produtos..." />
          ) : hasMoreSections ? (
            <div className="h-4 w-full" />
          ) : (
            <div className="text-center text-gray-500 text-sm">
              {!loadingSections && (
                <span>Não há mais seções para carregar.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
