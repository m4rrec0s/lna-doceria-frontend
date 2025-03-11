"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { Product } from "../../../types/product";

interface AddToCartButtonProps {
  onClick: () => void;
  product: Product;
}

const AddToCartButton = ({ onClick, product }: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCart();

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Adiciona o item com quantidade padrão 1
      addItem(product, 1);
      onClick();
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full">
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full p-4 rounded-full font-medium flex items-center justify-center gap-2 ${"bg-pink-500 text-white hover:bg-pink-600"}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isLoading ? (
          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            <span>Adicionar ao carrinho</span>
            <span className="text-lg">🛒</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default AddToCartButton;
