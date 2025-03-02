"use client";

import { motion } from "framer-motion";
import { useEasterTheme } from "../contexts/EasterThemeContext";

export default function EasterThemeToggle() {
  const { isEasterTheme, toggleEasterTheme } = useEasterTheme();

  return (
    <motion.button
      className="easter-theme-toggle"
      onClick={toggleEasterTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={
        isEasterTheme ? "Desativar tema de Páscoa" : "Ativar tema de Páscoa"
      }
    >
      {isEasterTheme ? "🐰" : "🥚"}
    </motion.button>
  );
}
