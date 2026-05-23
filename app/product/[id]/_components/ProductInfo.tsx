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
  const packageCategory = categories?.find(
    (cat) => cat.sellingType === "package",
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

  const hasDiscount = discount > 0;
  const discountedPrice = applyDiscount(price, discount);
  const savedAmount = price - discountedPrice;

  const renderSellingInfo = () => {
    if (sellingType === "package" && packageSizes.length > 0) {
      return (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <PackageCheck className="text-amber-700" size={20} />
          <span className="text-sm text-amber-900">
            Este produto é vendido em pacote{packageSizes.length > 1 ? "s" : ""}{" "}
            de {packageSizes.join(", ")} unidades
            {packageSizes.length > 1 ? " cada" : ""}
          </span>
        </div>
      );
    }

    if (sellingType === "unit") {
      return (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3">
          <Package2 className="text-sky-700" size={20} />
          <span className="text-sm text-sky-900">
            Este produto é vendido por unidade
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      className="space-y-4 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"
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
        <motion.div
          variants={fadeInUp}
          className="flex items-center gap-2 flex-wrap"
        >
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={"outline"}
              className="border-rose-200 bg-rose-50 font-semibold text-rose-700"
            >
              {category.name}
            </Badge>
          ))}
          {hasDiscount && (
            <Badge className="bg-rose-400 text-rose-950">{discount}% OFF</Badge>
          )}
        </motion.div>
      )}

      <motion.h1
        variants={fadeInUp}
        className="flex items-center gap-2 text-3xl font-bold text-zinc-900"
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
        className="text-2xl font-semibold text-rose-700"
      >
        {hasDiscount ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="mr-2 text-lg text-zinc-500 line-through">
                {formatCurrency(price)}
              </span>
              <span className="text-2xl font-semibold text-rose-700">
                {formatCurrency(discountedPrice)}
              </span>
            </div>
            <div className="mt-1 text-sm text-rose-700">
              Você economiza {formatCurrency(savedAmount)} ({discount}% de
              desconto)
            </div>
          </div>
        ) : (
          <span className="text-2xl font-semibold text-rose-700">
            {formatCurrency(price)}
          </span>
        )}
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="rounded-lg border border-zinc-200 p-4"
      >
        <p className="text-zinc-600">{description}</p>
      </motion.div>
    </motion.div>
  );
};

export default ProductInfo;
