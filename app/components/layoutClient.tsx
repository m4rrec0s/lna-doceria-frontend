"use client";

import { AuthProvider } from "../context/authContext";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
