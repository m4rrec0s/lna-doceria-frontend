import { Product } from "../types/product";
import ProductItem from "./productItem";
import { motion } from "framer-motion";
import { containerAnimation } from "../utils/animations";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <motion.div
      variants={containerAnimation}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="grid justify-center grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {products.map((product: Product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </motion.div>
  );
};

export default ProductGrid;
