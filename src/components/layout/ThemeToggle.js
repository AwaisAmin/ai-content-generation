"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/components/layout/ThemeScript";
import { cn } from "@/lib/cn";

// The theme lives on <html data-theme>, set before paint by ThemeScript.
// Reading it as an external store keeps hydration clean: the server snapshot
// is "light" and React re-renders with the real value right after.
function subscribe(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.dataset.theme ?? "light";
const getServerSnapshot = () => "light";

export default function ThemeToggle({ className }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the toggle still works.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full text-foreground/80",
        "transition-[background-color,color,scale] duration-200 hover:bg-surface-sunken hover:text-foreground active:scale-90",
        className,
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "absolute size-[18px] transition-[rotate,scale,opacity] duration-500 ease-spring",
          isDark ? "rotate-0 opacity-100" : "-rotate-90 scale-50 opacity-0",
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute size-[18px] transition-[rotate,scale,opacity] duration-500 ease-spring",
          isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 opacity-100",
        )}
      />
    </button>
  );
}
