"use client";

import "./globals.css";
import Banner from "./components/banner";
import Header from "./components/header";
import ContainerProductList from "./containers/ContainerProductList";
import { motion } from "framer-motion";
import { fadeInUp } from "./utils/animations";

export default function Home() {
  return (
    <main className="w-screen">
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
            <Banner
              imageUrl="/bannerImage.png"
              title="Confira Aqui"
              description="Brigadeiros"
              route="/products"
            />
          </motion.div>
        </div>
      </section>
      <div className="px-8 mt-6 overflow-x-auto">
        <ContainerProductList />
      </div>
    </main>
  );
}
