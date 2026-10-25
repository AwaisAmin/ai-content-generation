"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Breakpoint at which the prompt panel becomes a sidebar (Tailwind `md`). */
export const DESKTOP_QUERY = "(min-width: 48rem)";

/**
 * Live `matchMedia` result. Renders `false` on the server and during
 * hydration, then updates to the real value — no hydration mismatch.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
