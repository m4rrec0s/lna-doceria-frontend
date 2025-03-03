"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "../../../utils/animations";
import { formatCurrency } from "@/app/utils/format";
import { Category } from "@/app/types/category";
import { Badge } from "../../../components/ui/badge";

interface ProductInfoProps {
  name: string;
  price: number;
  description: string;
  categories?: Category[];
}

const ProductInfo = ({
  name,
  price,
  description,
  categories,
}: ProductInfoProps) => {
  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
    >
      {categories && (
        <motion.div variants={fadeInUp} className="flex items-center gap-2">
          {categories.map((category) => (
            <Badge key={category.id} className="text-pink-700 font-bold">
              {category.name}
            </Badge>
          ))}
        </motion.div>
      )}

      <motion.h1
        variants={fadeInUp}
        className="text-3xl font-bold flex items-center gap-2"
      >
        {name}
        <motion.span
          role="img"
          aria-label="sparkles"
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: [0, 10, 0, -10, 0], scale: [0.9, 1.1, 0.9] }}
          transition={{
            duration: 2,
            delay: 1,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          ✨
        </motion.span>
      </motion.h1>

      <motion.div
        variants={fadeInUp}
        className="text-2xl font-semibold text-pink-600"
      >
        {formatCurrency(price)}
      </motion.div>

      <motion.div variants={fadeInUp} className="p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📝</span>
          <span className="font-medium">Descrição</span>
        </div>
        <p className="opacity-60">{description}</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex items-center gap-2">
        <span className="text-sm font-medium"></span>
      </motion.div>
    </motion.div>
  );
};

export default ProductInfo;
