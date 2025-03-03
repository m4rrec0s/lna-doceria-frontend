"use client";

import { Product } from "../../../types/product";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "../../../utils/format";

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

const RelatedProducts = ({
  products,
  title = "Você também pode gostar",
}: RelatedProductsProps) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-16">
      <motion.h2
        className="text-2xl font-bold mb-6 flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
        <motion.span
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -10, 20, -10, 0] }}
          transition={{
            duration: 1.5,
            delay: 1,
            repeat: Infinity,
            repeatDelay: 5,
          }}
        >
          🍩
        </motion.span>
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product, index) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <motion.div
              className="bg-white rounded-lg overflow-hidden border border-pink-100 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="relative w-full h-40">
                <Image
                  src={product.imageUrl?.[0] || "/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-pink-600 text-sm font-semibold mt-1">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
