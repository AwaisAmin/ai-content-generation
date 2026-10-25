"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Enhances a horizontal scroller:
 * - tracks whether it can scroll further left / right (for edge fades and
 *   arrow buttons),
 * - maps vertical mouse-wheel movement to horizontal scrolling, but hands
 *   the wheel back to the page once the strip reaches either end.
 *
 * Pass a `contentKey` that changes when the children change so the edges
 * are re-measured.
 */
export function useHorizontalScroll(contentKey) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    const atStart = node.scrollLeft <= 1;
    const atEnd = node.scrollLeft >= max - 1;
    setEdges((prev) =>
      prev.atStart === atStart && prev.atEnd === atEnd ? prev : { atStart, atEnd },
    );
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    function handleWheel(event) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = node.scrollWidth - node.clientWidth;
      const blocked =
        (event.deltaY < 0 && node.scrollLeft <= 0) ||
        (event.deltaY > 0 && node.scrollLeft >= max);
      if (blocked) return;
      event.preventDefault();
      node.scrollLeft += event.deltaY;
    }

    const frame = requestAnimationFrame(measure);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);
    node.addEventListener("scroll", measure, { passive: true });
    node.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      node.removeEventListener("scroll", measure);
      node.removeEventListener("wheel", handleWheel);
    };
  }, [measure, contentKey]);

  const scrollByPage = useCallback((direction) => {
    const node = ref.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  return { ref, ...edges, scrollByPage };
}
