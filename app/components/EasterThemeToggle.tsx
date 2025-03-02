"use client";

import { motion } from "framer-motion";
import { useEasterTheme } from "../contexts/EasterThemeContext";
import { useEffect } from "react";

export default function EasterThemeToggle() {
  const {
    isEasterTheme,
    isDarkTheme,
    toggleEasterTheme,
    toggleDarkTheme,
    isDashboardPage,
  } = useEasterTheme();

  useEffect(() => {
    console.log("EasterThemeToggle montado:", {
      isEasterTheme,
      isDarkTheme,
      isDashboardPage,
      buttonMode: isDashboardPage ? "dark/light" : "easter",
    });
  }, [isEasterTheme, isDarkTheme, isDashboardPage]);

  const handleToggle = () => {
    console.log(
      "Toggle clicado na página:",
      isDashboardPage ? "dashboard" : "principal"
    );
    if (isDashboardPage) {
      toggleDarkTheme();
    } else {
      toggleEasterTheme();
    }
  };

  const getButtonContent = () => {
    if (isDashboardPage) {
      return isDarkTheme ? "🌙" : "☀️";
    } else {
      return isEasterTheme ? "🐰" : "🥚";
    }
  };

  const getButtonTitle = () => {
    if (isDashboardPage) {
      return isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro";
    } else {
      return isEasterTheme
        ? "Desativar tema de Páscoa"
        : "Ativar tema de Páscoa";
    }
  };

  return (
    <motion.button
      className="easter-theme-toggle"
      onClick={handleToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={getButtonTitle()}
    >
      {getButtonContent()}
    </motion.button>
  );
}
