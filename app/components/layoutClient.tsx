"use client";

import { useEasterTheme } from "../contexts/EasterThemeContext";
import { useEffect } from "react";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { forceApplyTheme } = useEasterTheme();

  useEffect(() => {
    forceApplyTheme();
  }, [forceApplyTheme]);

  return <>{children}</>;
}
