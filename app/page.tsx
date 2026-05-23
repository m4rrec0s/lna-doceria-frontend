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
import { Category } from "./types/category";

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
  category?: Category | null;
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

  const sections =
    data?.pages
      .flatMap((page) => page.sections)
      .filter((section) => section.active) || [];

  return (
    <main className="w-full overflow-x-hidden bg-rose-50/40">
      <Header />
      <section className="mb-8 mt-6">
        <BannerPanel />
      </section>
      <div className="mx-auto grid w-full max-w-screen-2xl gap-6 px-4 pb-10 md:px-6">
        {isLoading && <ItemsListSkeleton />}

        {sections.length > 0
          ? sections.map((section) => (
              <ProductList
                key={section.id}
                title={section.title}
                products={section.products || []}
                category={section.category ?? null}
                loading={false}
                error={null}
                sectionId={section.id}
              />
            ))
          : !isLoading &&
            !error && (
              <div className="text-center py-10">
                <p className="text-zinc-500 dark:text-gray-400">
                  Nenhuma seção de produtos configurada
                </p>
              </div>
            )}

        {isFetchingNextPage && <ItemsListSkeleton />}

        {hasNextPage && !isFetchingNextPage && (
          <div ref={ref} className="h-16" />
        )}

        {!hasNextPage && sections.length > 0 && !isLoading && (
          <div className="pb-8 text-center text-zinc-500">
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
