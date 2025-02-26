"use client";

import ProductItem from "./productItem";
import { Product } from "../types/product";
import LoadingDots from "./LoadingDots";
import { motion } from "framer-motion";
import { containerAnimation, fadeInUp } from "../utils/animations";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const ProductList = ({ products, loading, error }: ProductListProps) => {
  if (loading) {
    return (
      <section className="flex justify-center items-center h-full">
        <LoadingDots />
      </section>
    );
  }

  if (error) {
    return <section>{error}</section>;
  }

  return (
    <section className="">
      <motion.h1
        className="text-2xl font-bold mb-6"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        Tradicionais
      </motion.h1>
      <motion.div
        className="flex gap-6 pb-4"
        variants={containerAnimation}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <ul className="flex gap-6">
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </ul>
      </motion.div>
    </section>
  );
};

export default ProductList;
