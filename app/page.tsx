/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import "./globals.css";
import Header from "./components/header";
import { useEffect, useState } from "react";
import { Product } from "./types/product";
import { useApi } from "./hooks/useApi";
import { motion } from "framer-motion";
import { fadeInUp } from "./utils/animations";
import ProductList from "./components/productList";
import { ProductSection } from "./components/dashboard/ProductDisplaySettings";
import BannerContainer from "./components/bannerContainer";
import { useEasterTheme } from "./contexts/EasterThemeContext";

// Componente para garantir aplicação do tema na página principal com prioridade alta
function EnsureTheme() {
  const { isEasterTheme } = useEasterTheme();

  // Aplicar o tema imediatamente quando o componente monta
  useEffect(() => {
    const applyTheme = () => {
      if (isEasterTheme) {
        console.log("EnsureTheme: Aplicando tema Easter na página principal");
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("easter");
      } else {
        console.log("EnsureTheme: Removendo tema Easter na página principal");
        document.documentElement.classList.remove("easter");
        document.documentElement.classList.remove("dark");
      }
    };

    // Aplicar tema imediatamente
    applyTheme();

    // E também aplicar após um pequeno delay para garantir
    // que seja aplicado após qualquer transição de página
    const timer = setTimeout(applyTheme, 50);

    return () => clearTimeout(timer);
  }, [isEasterTheme]);

  return null;
}

export default function Home() {
  const { getProducts, getDisplaySettings } = useApi();
  const [displaySections, setDisplaySections] = useState<ProductSection[]>([]);
  const [sectionProducts, setSectionProducts] = useState<
    Record<string, Product[]>
  >({});
  const [loadingSections, setLoadingSections] = useState(true);

  const bannerData: {
    imageUrl: string;
    title: string;
    description: string;
    route: string;
    variant: "blue" | "green" | "pink" | "purple" | "default";
    brightness?: boolean;
  }[] = [
    {
      imageUrl:
        "https://i.pinimg.com/736x/a5/95/58/a59558852b2b2e3fb7d663c553b1c8af.jpg",
      title: "Para sua Páscoa",
      description: "Ovos de páscoa recheados",
      route: "#",
      variant: "purple",
      brightness: true,
    },
    {
      imageUrl:
        "https://i.pinimg.com/736x/e2/5f/d9/e25fd9779ef23538a029863efef3452e.jpg",
      title: "Novidades",
      description: "Doces Especiais",
      route: "#",
      variant: "blue",
      brightness: true,
    },
    {
      imageUrl:
        "https://i.pinimg.com/736x/a1/41/fd/a141fde1a2310071782378d1bdca8bdd.jpg",
      title: "Exclusivos",
      description: "Chocolate Premium",
      route: "#",
      variant: "purple",
      brightness: true,
    },
    {
      imageUrl:
        "https://i.pinimg.com/736x/d4/81/9e/d4819e2518d3cb34d5e0c966a77d6984.jpg",
      title: "Tradicionais",
      description: "Melhores Brigadeiros",
      route: "#",
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
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!displaySections.length) return;

    const loadSectionProducts = async () => {
      setLoadingSections(true);
      const sectionsData: Record<string, Product[]> = {};

      for (const section of displaySections) {
        try {
          if (section.type === "category" && section.categoryId) {
            const products = await getProducts({
              categoryId: section.categoryId,
              per_page: 10,
            });
            sectionsData[section.id] = Array.isArray(products) ? products : [];
          } else if (
            (section.type === "custom" || section.type === "featured") &&
            section.productIds?.length
          ) {
            const products = await getProducts({
              ids: section.productIds, // Adicionando os IDs específicos na query
              per_page: 100, // Aumentando o limite para garantir que todos os produtos sejam carregados
            });
            sectionsData[section.id] = Array.isArray(products)
              ? products.filter((p) => section.productIds?.includes(p.id))
              : [];
          }
        } catch (error) {
          console.error(
            `Erro ao carregar produtos da seção ${section.id}:`,
            error
          );
          sectionsData[section.id] = [];
        }
      }

      setSectionProducts(sectionsData);
      setLoadingSections(false);
    };

    loadSectionProducts();
  }, [displaySections]);

  return (
    <main className="w-full overflow-x-hidden">
      <EnsureTheme />
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
              Experimente e Aprecie
            </motion.h1>
            <motion.h2
              className="text-3xl md:text-4xl font-bold flex items-center gap-2"
              variants={fadeInUp}
            >
              Doces de Qualidade{" "}
              <motion.span
                role="img"
                aria-label="cake"
                initial={{ rotate: -10 }}
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{
                  duration: 1.5,
                  delay: 1,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
              >
                🍰
              </motion.span>
            </motion.h2>
          </motion.div>

          <motion.div>
            <BannerContainer banners={bannerData} />
          </motion.div>
        </div>
      </section>
      <div className="space-y-8 py-8 px-8">
        {displaySections.map((section) => (
          <ProductList
            key={section.id}
            title={section.title}
            products={sectionProducts[section.id] || []}
            loading={loadingSections}
            error={null}
          />
        ))}
      </div>
    </main>
  );
}
