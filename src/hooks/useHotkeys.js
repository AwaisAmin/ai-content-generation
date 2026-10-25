"use client";

import { useEffect, useRef } from "react";

function isTyping(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Single-key shortcuts, e.g. `useHotkeys({ s: star, "?": showHelp })`.
 * Ignored while typing, with Ctrl/⌘/Alt held, inside an open modal dialog
 * (unless `inDialogs`), or when another handler already claimed the key.
 */
export function useHotkeys(bindings, { enabled = true, inDialogs = false } = {}) {
  const bindingsRef = useRef(bindings);
  useEffect(() => {
    bindingsRef.current = bindings;
  });

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTyping(event.target)) return;
      if (!inDialogs && document.querySelector("dialog[open]:modal")) return;

      const handler = bindingsRef.current[event.key.toLowerCase()] ?? bindingsRef.current[event.key];
      if (!handler) return;
      event.preventDefault();
      handler(event);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, inDialogs]);
}
