"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingDotsProps {
  text?: string;
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export function LoadingDots({
  text = "Carregando doces...",
  size = "medium",
  showText = true,
}: LoadingDotsProps) {
  const [sprinkles, setSprinkles] = useState<
    { id: number; x: number; y: number; delay: number; scale: number }[]
  >([]);

  // Size mapping
  const sizeMap = {
    small: {
      container: "w-16 h-16",
      brigadeiro: "w-8 h-8",
      fontSize: "text-xs",
      sprinkleCount: 8,
    },
    medium: {
      container: "w-24 h-24",
      brigadeiro: "w-12 h-12",
      fontSize: "text-sm",
      sprinkleCount: 12,
    },
    large: {
      container: "w-32 h-32",
      brigadeiro: "w-16 h-16",
      fontSize: "text-base",
      sprinkleCount: 16,
    },
  };

  // Generate random sprinkles
  useEffect(() => {
    const newSprinkles = [];
    for (let i = 0; i < sizeMap[size].sprinkleCount; i++) {
      newSprinkles.push({
        id: i,
        x: Math.random() * 100 - 50, // Position around the center
        y: Math.random() * 100 - 50,
        delay: Math.random() * 0.5,
        scale: 0.5 + Math.random() * 0.5,
      });
    }
    setSprinkles(newSprinkles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`relative ${sizeMap[size].container} flex items-center justify-center`}
      >
        {/* Pulsing background circle */}
        <motion.div
          className="absolute rounded-full bg-pink-100"
          initial={{ width: "60%", height: "60%", opacity: 0.5 }}
          animate={{
            width: "100%",
            height: "100%",
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Sprinkles */}
        <AnimatePresence>
          {sprinkles.map((sprinkle) => (
            <motion.div
              key={sprinkle.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-pink-300"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: sprinkle.x,
                y: sprinkle.y,
                opacity: [0, 1, 0],
                scale: sprinkle.scale,
              }}
              transition={{
                duration: 2,
                delay: sprinkle.delay,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </AnimatePresence>

        {/* Brigadeiro */}
        <motion.div
          className={`relative ${sizeMap[size].brigadeiro} z-10`}
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: {
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <BrigadeiroSvg />
        </motion.div>
      </div>

      {/* Loading text */}
      {showText && (
        <motion.p
          className={`mt-4 text-pink-700 font-medium ${sizeMap[size].fontSize}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingText text={text} />
        </motion.p>
      )}
    </div>
  );
}

// Brigadeiro SVG Component
function BrigadeiroSvg() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Base chocolate */}
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="#5D4037"
        initial={{ scale: 0.9 }}
        animate={{ scale: [0.95, 1, 0.95] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Chocolate texture */}
      <motion.path
        d="M30,40 Q50,20 70,40 Q90,60 70,80 Q50,100 30,80 Q10,60 30,40 Z"
        fill="#4E342E"
        fillOpacity="0.5"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Sprinkles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = 50 + 30 * Math.cos(angle);
        const y = 50 + 30 * Math.sin(angle);
        const colors = ["#EC407A", "#F48FB1", "#F8BBD0", "#FFEB3B", "#FFF176"];
        const color = colors[i % colors.length];

        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={color}
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Highlight */}
      <motion.ellipse
        cx="35"
        cy="35"
        rx="15"
        ry="10"
        fill="white"
        fillOpacity="0.2"
        initial={{ opacity: 0.1 }}
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}

// Animated loading text with dots
function LoadingText({ text }: { text: string }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span>
      {text}
      <span className="inline-block w-8">{dots}</span>
    </span>
  );
}
