"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useApi } from "./hooks/useApi";
import ProductList, { ItemsListSkeleton } from "./components/productList";
import { BannerPanel } from "./components/bannerPanel";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { WhatsAppButton } from "./components/whatsappButton";
import { Footer } from "./components/footer";
import Header from "./components/header";
import { Product } from "./types/product";
import { Category } from "./types/category";
import WhatsappIcon from "@/public/whatsappIcon";

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

      <section className="mt-6">
        <BannerPanel />
      </section>

      <section className="mx-auto my-5 w-full max-w-screen-2xl md:px-6">
        <div className="rpx-5 py-4 ">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-center">
              <h2 className="mt-2 text-2xl font-bold text-rose-950">
                Acesse nossas redes
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Atendimento rapido e novidades no Instagram.
              </p>
            </div>
            <div className="flex justify-center flex-wrap gap-3">
              <Link
                href="https://www.instagram.com/lna.doceria/"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-rose-600 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </Link>
              <Link
                href="https://wa.me/558388511950?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20doces%20da%20LNA%20Doceria."
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                <WhatsappIcon size={16} color="#ffffff" /> WhatsApp
              </Link>
            </div>
          </div>
        </div>
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
