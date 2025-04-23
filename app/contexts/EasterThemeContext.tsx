"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface EasterThemeContextType {
  isEasterTheme: boolean;
  isDarkTheme: boolean;
  toggleEasterTheme: () => void;
  toggleDarkTheme: () => void;
  forceApplyTheme: () => void;
  isDashboardPage: boolean;
}

const EasterThemeContext = createContext<EasterThemeContextType | undefined>(
  undefined
);

export function EasterThemeProvider({ children }: { children: ReactNode }) {
  const [isEasterTheme, setIsEasterTheme] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDashboardPage, setIsDashboardPage] = useState(false);

  useEffect(() => {
    const checkIfDashboard = () => {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const dashboardCheck =
          path === "/dashboard" || path.startsWith("/dashboard/");
        setIsDashboardPage(dashboardCheck);
      }
    };

    checkIfDashboard();

    const handleRouteChange = () => {
      checkIfDashboard();
    };

    window.addEventListener("popstate", handleRouteChange);

    if (typeof window !== "undefined") {
      // @ts-expect-error - Verificando a existência do router do Next.js
      if (window.next && window.next.router) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.next.router.events.on("routeChangeComplete", handleRouteChange);
      }
    }

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (typeof window !== "undefined" && window.next && window.next.router) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.next.router.events.off("routeChangeComplete", handleRouteChange);
      }
    };
  }, []);

  useEffect(() => {
    setIsEasterTheme(false);

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

  const toggleEasterTheme = () => {
    return;
  };

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
        isEasterTheme: false, // Sempre false para desabilitar o tema de Páscoa
        isDarkTheme,
        toggleEasterTheme,
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
