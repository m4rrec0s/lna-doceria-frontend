"use client";

import { motion } from "framer-motion";
import { useEasterTheme } from "../contexts/EasterThemeContext";

export default function EasterThemeToggle() {
  const { isDarkTheme, toggleDarkTheme } = useEasterTheme();

  const handleToggle = () => {
    toggleDarkTheme();
  };

  const getButtonContent = () => {
    return isDarkTheme ? "🌙" : "☀️";
  };

  const getButtonTitle = () => {
    return isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro";
  };

  return (
    <motion.button
      className="theme-toggle"
      onClick={handleToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={getButtonTitle()}
    >
      {getButtonContent()}
    </motion.button>
  );
}
