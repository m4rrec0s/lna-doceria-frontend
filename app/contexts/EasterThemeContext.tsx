"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

interface EasterThemeContextType {
  isDarkTheme: boolean;
  toggleDarkTheme: () => void;
  forceApplyTheme: () => void;
  isDashboardPage: boolean;
}

const EasterThemeContext = createContext<EasterThemeContextType | undefined>(
  undefined
);

export function EasterThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDashboardPage, setIsDashboardPage] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isDashboard =
      pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    setIsDashboardPage(isDashboard);
  }, [pathname]);

  useEffect(() => {
    const savedDarkPreference = localStorage.getItem("darkTheme");

    if (savedDarkPreference !== null) {
      setIsDarkTheme(savedDarkPreference === "true");
    } else {
      setIsDarkTheme(false);
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    document.documentElement.classList.remove("easter", "dark");

    if (isDashboardPage && isDarkTheme) {
      document.documentElement.classList.add("dark");
    }

    localStorage.setItem("darkTheme", isDarkTheme.toString());
  }, [isDarkTheme, isInitialized, isDashboardPage]);

  const toggleDarkTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  const forceApplyTheme = () => {
    document.documentElement.classList.remove("easter", "dark");

    if (isDashboardPage && isDarkTheme) {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <EasterThemeContext.Provider
      value={{
        isDarkTheme,
        toggleDarkTheme,
        forceApplyTheme,
        isDashboardPage,
      }}
    >
      {children}
    </EasterThemeContext.Provider>
  );
}

export function useEasterTheme() {
  const context = useContext(EasterThemeContext);
  if (context === undefined) {
    throw new Error(
      "useEasterTheme must be used within an EasterThemeProvider"
    );
  }
  return context;
}
