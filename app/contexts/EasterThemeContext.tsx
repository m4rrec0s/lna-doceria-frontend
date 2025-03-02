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

  // Verificar URL atual
  useEffect(() => {
    const checkIfDashboard = () => {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const dashboardCheck =
          path === "/dashboard" || path.startsWith("/dashboard/");
        console.log("Current path:", path, "isDashboard:", dashboardCheck);
        setIsDashboardPage(dashboardCheck);
      }
    };

    checkIfDashboard();

    // Usar tanto popstate quanto Next.js router events quando disponível
    const handleRouteChange = () => {
      checkIfDashboard();
    };

    window.addEventListener("popstate", handleRouteChange);

    // Para Next.js router (se disponível)
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

  // Carregar a preferência no cliente
  useEffect(() => {
    // Verificar se é época de Páscoa (março/abril)
    const date = new Date();
    const month = date.getMonth() + 1; // getMonth é baseado em zero
    const isEasterSeason = month === 3 || month === 4;

    // Verificar se há preferência salva
    const savedEasterPreference = localStorage.getItem("easterTheme");
    const savedDarkPreference = localStorage.getItem("darkTheme");

    // Determinar o estado inicial
    let initialEasterTheme = false;
    if (savedEasterPreference !== null) {
      initialEasterTheme = savedEasterPreference === "true";
    } else {
      // Se não há preferência salva, usar regra sazonal
      initialEasterTheme = isEasterSeason;
    }
    setIsEasterTheme(initialEasterTheme);
    console.log("Tema de Páscoa inicial:", initialEasterTheme);

    if (savedDarkPreference !== null) {
      setIsDarkTheme(savedDarkPreference === "true");
    } else {
      // Valor padrão para o tema escuro
      setIsDarkTheme(false);
    }

    setIsInitialized(true);
  }, []);

  // Aplicar a classe no documento quando o tema muda
  useEffect(() => {
    if (!isInitialized) return;

    // Debug
    console.log("Aplicando tema:", {
      isEasterTheme,
      isDarkTheme,
      isDashboardPage,
      classToAdd:
        isDashboardPage && isDarkTheme
          ? "dark"
          : !isDashboardPage && isEasterTheme
          ? "easter"
          : "none",
    });

    // Remover todas as classes de tema primeiro
    document.documentElement.classList.remove("easter", "dark");

    // Aplicar o tema adequado
    if (isDashboardPage && isDarkTheme) {
      document.documentElement.classList.add("dark");
    } else if (!isDashboardPage && isEasterTheme) {
      document.documentElement.classList.add("easter");
    }

    // Salvar as preferências
    localStorage.setItem("easterTheme", isEasterTheme.toString());
    localStorage.setItem("darkTheme", isDarkTheme.toString());
  }, [isEasterTheme, isDarkTheme, isInitialized, isDashboardPage]);

  const toggleEasterTheme = () => {
    console.log("Alternando tema de Páscoa:", !isEasterTheme);
    setIsEasterTheme((prev) => !prev);
  };

  const toggleDarkTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  const forceApplyTheme = () => {
    document.documentElement.classList.remove("easter", "dark");

    if (isDashboardPage && isDarkTheme) {
      document.documentElement.classList.add("dark");
    } else if (!isDashboardPage && isEasterTheme) {
      document.documentElement.classList.add("easter");
    }
  };

  return (
    <EasterThemeContext.Provider
      value={{
        isEasterTheme,
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
