"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "../../../utils/animations";
import { formatCurrency } from "../../../helpers/formatCurrency";
import { applyDiscount } from "../../../helpers/applyDiscount";
import { Category } from "../../../types/category";
import { Badge } from "../../../components/ui/badge";
import { Package2, PackageCheck } from "lucide-react";

interface ProductInfoProps {
  name: string;
  price: number;
  description: string;
  categories: Category[];
  discount?: number;
}

const ProductInfo = ({
  name,
  price,
  description,
  categories = [],
  discount = 0,
}: ProductInfoProps) => {
  // Determinar o tipo de venda e tamanhos de pacote
  const packageCategory = categories?.find(
    (cat) => cat.sellingType === "package"
  );
  const sellingType = packageCategory ? "package" : "unit";
  let packageSizes: number[] = [];
  if (packageCategory && packageCategory.packageSizes) {
    packageSizes =
      typeof packageCategory.packageSizes === "string"
        ? JSON.parse(packageCategory.packageSizes)
        : Array.isArray(packageCategory.packageSizes)
        ? packageCategory.packageSizes
        : [];
  }

  // Informação de venda baseada no tipo
  const renderSellingInfo = () => {
    if (sellingType === "package" && packageSizes.length > 0) {
      return (
        <div className="flex items-center gap-2 bg-pink-50 p-3 rounded-md mb-4">
          <PackageCheck className="text-pink-500" size={22} />
          <span className="text-sm text-gray-700">
            Este produto é vendido em pacote{packageSizes.length > 1 ? "s" : ""}{" "}
            de {packageSizes.join(", ")} unidades
            {packageSizes.length > 1 ? " cada" : ""}
          </span>
        </div>
      );
    }

    if (sellingType === "unit") {
      return (
        <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md mb-4">
          <Package2 className="text-blue-500" size={22} />
          <span className="text-sm text-gray-700">
            Este produto é vendido por unidade
          </span>
        </div>
      );
    }

    return null;
  };

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

      {renderSellingInfo()}

      <motion.div
        variants={fadeInUp}
        className="text-2xl font-semibold text-pink-600"
      >
        {discount > 0 && (
          <span className="text-gray-500 line-through mr-2 text-sm">
            {formatCurrency(price)}
          </span>
        )}
        <span className="text-2xl font-semibold text-pink-600">
          {formatCurrency(applyDiscount(price, discount))}
        </span>
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
