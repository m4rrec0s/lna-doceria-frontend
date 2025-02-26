"use client";

import { motion } from "framer-motion";

const LoadingDots = () => {
  // Cores que remetem a doces e chocolates
  const colors = ["#8B4513", "#D2691E", "#A0522D", "#CD853F"];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex gap-4 mb-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: colors[index % colors.length] }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
      <p className="text-lg text-brown-600 font-medium">
        Carregando delícias...
      </p>
    </div>
  );
};

export default LoadingDots;
