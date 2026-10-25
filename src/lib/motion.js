/*
 * CSS animations already respect `prefers-reduced-motion` (globals.css).
 * These cover motion started from JavaScript, which CSS can't reach.
 */

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** `behavior` for scrollIntoView / scrollBy: instant when motion is reduced. */
export function scrollBehavior() {
  return prefersReducedMotion() ? "auto" : "smooth";
}
