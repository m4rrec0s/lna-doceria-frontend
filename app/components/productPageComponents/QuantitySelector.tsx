"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface QuantitySelectorProps {
  initialQuantity?: number;
  onChange: (quantity: number) => void;
  max?: number;
}

const QuantitySelector = ({
  initialQuantity = 1,
  onChange,
  max = 99,
}: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const increment = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onChange(newQuantity);
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onChange(newQuantity);
    }
  };

  return (
    <div className="flex items-center">
      <span className="font-medium mr-3">Quantidade:</span>
      <div className="flex items-center border border-pink-200 rounded-full overflow-hidden">
        <motion.button
          whileHover={{ backgroundColor: "#FECDD3" }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center text-pink-600"
          onClick={decrement}
          disabled={quantity <= 1}
        >
          −
        </motion.button>

        <div className="w-12 text-center font-medium">{quantity}</div>

        <motion.button
          whileHover={{ backgroundColor: "#FECDD3" }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center text-pink-600"
          onClick={increment}
          disabled={quantity >= max}
        >
          +
        </motion.button>
      </div>
    </div>
  );
};

export default QuantitySelector;
