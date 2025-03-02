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
  toggleEasterTheme: () => void;
  forceApplyTheme: () => void;
}

const EasterThemeContext = createContext<EasterThemeContextType | undefined>(
  undefined
);

export function EasterThemeProvider({ children }: { children: ReactNode }) {
  const [isEasterTheme, setIsEasterTheme] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar a preferência no cliente
  useEffect(() => {
    // Verificar se é época de Páscoa (março/abril)
    const date = new Date();
    const month = date.getMonth() + 1; // getMonth é baseado em zero
    const isEasterSeason = month === 3 || month === 4;

    // Verificar se há preferência salva
    const savedPreference = localStorage.getItem("easterTheme");

    // Determinar o estado inicial
    if (savedPreference !== null) {
      setIsEasterTheme(savedPreference === "true");
    } else {
      // Se não há preferência salva, usar regra sazonal
      setIsEasterTheme(isEasterSeason);
    }

    setIsInitialized(true);
  }, []);

  // Aplicar a classe no documento quando o tema muda
  useEffect(() => {
    if (!isInitialized) return;

    if (isEasterTheme) {
      document.documentElement.classList.add("easter");
    } else {
      document.documentElement.classList.remove("easter");
    }

    // Salvar a preferência
    localStorage.setItem("easterTheme", isEasterTheme.toString());
  }, [isEasterTheme, isInitialized]);

  const toggleEasterTheme = () => {
    setIsEasterTheme((prev) => !prev);
  };

  const forceApplyTheme = () => {
    if (isEasterTheme) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("easter");
    } else {
      document.documentElement.classList.remove("easter");
    }
  };

  return (
    <EasterThemeContext.Provider
      value={{ isEasterTheme, toggleEasterTheme, forceApplyTheme }}
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
