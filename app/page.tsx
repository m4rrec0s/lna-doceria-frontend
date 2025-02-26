"use client";

import "./globals.css";
import Banner from "./components/banner";
import Header from "./components/header";
import { useEffect, useState } from "react";
import { Product } from "./types/product";
import { useApi } from "./hooks/useApi";
import { motion } from "framer-motion";
import { fadeInUp } from "./utils/animations";
import ProductList from "./components/productList";

export default function Home() {
  const { getProducts } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(Array.isArray(productsData) ? productsData : []);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setError(error as string);
        setLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="w-full overflow-x-hidden">
      <Header />
      <section className="mt-[100px]">
        <div className="px-4 md:px-8">
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
            <Banner
              imageUrl="/bannerImage.png"
              title="Confira Aqui"
              description="Brigadeiros"
              route="/products"
            />
          </motion.div>
        </div>
      </section>
      <div className="px-4 md:px-8 mt-6">
        <div className="py-6">
          {loading ? (
            <div className="w-full py-8 flex justify-center">
              <p>Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="w-full py-8 text-center">
              <p>Nenhum produto disponível no momento.</p>
            </div>
          ) : (
            <ProductList products={products} loading={loading} error={error} />
          )}
        </div>
      </div>
    </main>
  );
}
