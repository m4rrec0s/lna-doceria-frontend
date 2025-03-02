"use client";

import { useEasterTheme } from "../contexts/EasterThemeContext";
import EasterElements from "./EasterElements";
import EasterThemeToggle from "./EasterThemeToggle";
import { useEffect } from "react";

export default function EasterClientWrapper() {
  const { isEasterTheme, isDashboardPage, forceApplyTheme } = useEasterTheme();

  // Força a aplicação do tema quando o componente monta
  useEffect(() => {
    forceApplyTheme();
    console.log("EasterClientWrapper montado:", {
      isEasterTheme,
      isDashboardPage,
    });
  }, [forceApplyTheme, isEasterTheme, isDashboardPage]);

  return (
    <>
      <EasterThemeToggle />
      {isEasterTheme && !isDashboardPage && (
        <>
          <div className="debug-info" style={{ display: "none" }}>
            Easter Theme Active: {isEasterTheme ? "Sim" : "Não"}, Dashboard
            Page: {isDashboardPage ? "Sim" : "Não"}
          </div>
          <EasterElements />
        </>
      )}
    </>
  );
}
