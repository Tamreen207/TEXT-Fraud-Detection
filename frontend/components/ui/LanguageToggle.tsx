"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useFraudStore } from "@/store/useFraudStore";

export function LanguageToggle() {
  const { language, setLanguage } = useFraudStore();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 text-sm font-medium"
      title={`Switch to ${language === "en" ? "Hindi" : "English"}`}
    >
      <Languages className="w-4 h-4" />
      <span className="hidden sm:inline">
        {language === "en" ? "EN" : "हिंदी"}
      </span>
      <span className="sm:hidden">{language === "en" ? "EN" : "HI"}</span>
    </button>
  );
}
