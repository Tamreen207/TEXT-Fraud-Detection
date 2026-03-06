"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1.5 border border-border/40 rounded-lg bg-muted/30">
        <div className="p-1.5 rounded-md opacity-50">
          <Sun className="h-4 w-4" />
        </div>
        <div className="p-1.5 rounded-md opacity-50">
          <Moon className="h-4 w-4" />
        </div>
        <div className="p-1.5 rounded-md opacity-50">
          <Monitor className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1.5 border border-border/40 rounded-lg bg-muted/30 backdrop-blur-sm">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          theme === "light"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-foreground opacity-60 hover:opacity-100"
        }`}
        aria-label="Light Mode"
        title="Light Theme"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          theme === "dark"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-foreground opacity-60 hover:opacity-100"
        }`}
        aria-label="Dark Mode"
        title="Dark Theme"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          theme === "system"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-foreground opacity-60 hover:opacity-100"
        }`}
        aria-label="System Theme"
        title="System Theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
