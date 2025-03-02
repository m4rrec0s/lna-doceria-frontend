import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { EasterThemeProvider } from "./contexts/EasterThemeContext";
import EasterClientWrapper from "./components/EasterClientWrapper";
import LayoutClient from "./components/layoutClient";
import { Toaster } from "./components/ui/sonner";
import { CartProvider } from "./context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LNA - Doces & Bolos",
  description: "LNA - Doces & Bolos Artesanais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <EasterThemeProvider>
          <CartProvider>
            <LayoutClient>{children}</LayoutClient>
            <Toaster />
            <EasterClientWrapper />
          </CartProvider>
        </EasterThemeProvider>
      </body>
    </html>
  );
}
