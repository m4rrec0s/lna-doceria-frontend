import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { EasterThemeProvider } from "./contexts/EasterThemeContext";
import LayoutClient from "./components/layoutClient";
import { Toaster } from "./components/ui/sonner";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LNA Doceria",
  description: "Doces Gourmet 🧁",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <LayoutClient>
            <EasterThemeProvider>
              <CartProvider>
                <LayoutClient>{children}</LayoutClient>
                <Toaster />
              </CartProvider>
            </EasterThemeProvider>
          </LayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}
