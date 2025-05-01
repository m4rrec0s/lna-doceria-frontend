"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useApi } from "./hooks/useApi";
import ProductList, { ItemsListSkeleton } from "./components/productList";
import { BannerPanel } from "./components/bannerPanel";
import { WhatsAppButton } from "./components/whatsappButton";
import { Footer } from "./components/footer";
import Header from "./components/header";
import { Product } from "./types/product";

// Definição dos tipos
interface DisplaySection {
  id: string;
  title: string;
  type: "category" | "custom" | "discounted" | "new_arrivals";
  categoryId?: string | null;
  productIds?: string | null;
  active: boolean;
  order: number;
  startDate?: Date | null;
  endDate?: Date | null;
  tags?: string | null;
  products?: Product[];
}

interface DisplaySettingsResponse {
  sections: DisplaySection[];
  hasMore: boolean;
  page: number;
}

export default function Home() {
  const { getDisplaySettings } = useApi();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<DisplaySettingsResponse, Error>({
    queryKey: ["displaySections"],
    queryFn: ({ pageParam = 1 }) =>
      getDisplaySettings({ page: pageParam as number, limit: 10 }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sections = data?.pages.flatMap((page) => page.sections) || [];

  console.log("Sections:", sections);

  return (
    <main className="w-full overflow-x-hidden">
      <Header />
      <section className="mt-8 mb-6">
        <BannerPanel />
      </section>
      <div className="space-y-8 pt-4 w-full max-w-screen-xl mx-auto px-4">
        {isLoading && <ItemsListSkeleton />}

        {sections.length > 0
          ? sections.map((section) => (
              <ProductList
                key={section.id}
                title={section.title}
                products={section.products || []}
                loading={false}
                error={null}
                sectionId={section.id}
              />
            ))
          : !isLoading &&
            !error && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma seção de produtos configurada
                </p>
              </div>
            )}

        {isFetchingNextPage && <ItemsListSkeleton />}

        {hasNextPage && !isFetchingNextPage && (
          <div ref={ref} className="h-16" />
        )}

        {!hasNextPage && sections.length > 0 && !isLoading && (
          <div className="text-center text-gray-500 pb-8">
            Todas as seções carregadas
          </div>
        )}

        {error && (
          <div className="text-red-500 p-4 rounded bg-red-50 dark:bg-red-900/20">
            Erro ao carregar seções: {error.message}
          </div>
        )}
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
