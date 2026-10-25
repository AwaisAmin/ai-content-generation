"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Accessible segmented toggle (WAI-ARIA radio group with roving tabindex).
 * The highlight slides between equal-width segments, so no DOM measuring.
 */
export default function SegmentedControl({
  label,
  options,
  value,
  onChange,
  className,
}) {
  const buttonsRef = useRef([]);
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  function select(index) {
    const option = options[(index + options.length) % options.length];
    onChange(option.value);
    buttonsRef.current[options.indexOf(option)]?.focus();
  }

  function handleKeyDown(event) {
    const keyMap = {
      ArrowRight: activeIndex + 1,
      ArrowDown: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      ArrowUp: activeIndex - 1,
      Home: 0,
      End: options.length - 1,
    };
    if (event.key in keyMap) {
      event.preventDefault();
      select(keyMap[event.key]);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative grid rounded-full border border-border bg-surface p-1",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 rounded-full bg-surface-sunken transition-transform duration-300 ease-out-soft"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {options.map((option, index) => {
        const isActive = index === activeIndex;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            ref={(node) => (buttonsRef.current[index] = node)}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 inline-flex h-8 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-colors duration-200",
              isActive ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
