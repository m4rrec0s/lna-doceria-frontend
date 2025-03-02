"use client";

import { useEasterTheme } from "../contexts/EasterThemeContext";
import EasterElements from "./EasterElements";
import EasterThemeToggle from "./EasterThemeToggle";

export default function EasterClientWrapper() {
  const { isEasterTheme } = useEasterTheme();

  return (
    <>
      <EasterThemeToggle />
      {isEasterTheme && <EasterElements />}
    </>
  );
}
