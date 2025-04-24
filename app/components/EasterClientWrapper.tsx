"use client";

import { useEasterTheme } from "../contexts/EasterThemeContext";
import { useEffect } from "react";

export default function EasterClientWrapper() {
  const { forceApplyTheme } = useEasterTheme();

  useEffect(() => {
    forceApplyTheme();
  }, [forceApplyTheme]);

  return <></>;
}
