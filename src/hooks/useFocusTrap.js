"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Keeps keyboard focus inside `containerRef` while `active`: moves focus in
 * on open, cycles Tab / Shift+Tab, calls `onEscape`, and restores focus to
 * where it was on close. For custom modal surfaces that can't use <dialog>.
 */
export function useFocusTrap(containerRef, active, { initialFocusRef, onEscape } = {}) {
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const previouslyFocused = document.activeElement;
    (initialFocusRef?.current ?? container.querySelector(FOCUSABLE))?.focus();

    function handleKeyDown(event) {
      // Inner widgets (e.g. an open Select) claim Escape by preventing it.
      if (event.key === "Escape" && !event.defaultPrevented) {
        onEscapeRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = [...container.querySelectorAll(FOCUSABLE)].filter(
        (element) => element.checkVisibility?.() ?? true,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef, initialFocusRef]);
}
