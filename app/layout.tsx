import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "./components/layoutClient";
import { Toaster } from "./components/ui/sonner";
import { CartProvider } from "./context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LNA Doceria",
  description: "Confeitaria de dar água na boca!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <CartProvider>
          <LayoutClient>{children}</LayoutClient>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
