"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // The server can't know the theme; keep the first client render identical to avoid a hydration mismatch.
  const hydrated = useHydrated();
  const isDark = hydrated && resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={hydrated ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle colour theme"}
      title="Toggle theme"
    >
      <Sun className="hidden size-[18px] dark:block" />
      <Moon className="size-[18px] dark:hidden" />
    </Button>
  );
}
