"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useEasterTheme } from "../contexts/EasterThemeContext";

const queryClient = new QueryClient();

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { isEasterTheme } = useEasterTheme();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
