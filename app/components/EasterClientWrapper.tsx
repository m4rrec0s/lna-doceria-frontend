"use client";

import { useEasterTheme } from "../contexts/EasterThemeContext";
import EasterThemeToggle from "./EasterThemeToggle";
import { useEffect } from "react";

export default function EasterClientWrapper() {
  const { isDashboardPage, forceApplyTheme } = useEasterTheme();

  useEffect(() => {
    forceApplyTheme();
  }, [forceApplyTheme]);

  return (
    <>
      <EasterThemeToggle />
    </>
  );
}
