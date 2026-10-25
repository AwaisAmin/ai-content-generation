"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Compact pill dropdown (WAI-ARIA select-only combobox pattern).
 *
 * - `label` is the accessible name; `prefix` is optional visible text shown
 *   before the value (e.g. "Model:").
 * - Keyboard: Arrow keys / Home / End move, Enter / Space pick, Escape / Tab
 *   close, and typing a letter jumps to the matching option.
 */
export default function Select({
  label,
  prefix,
  prefixClassName,
  options,
  value,
  onChange,
  placement = "bottom",
  align = "start",
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const id = useId();
  const listboxId = `${id}-listbox`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function openList() {
    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  }

  function commit(index) {
    onChange(options[index].value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event) {
    const last = options.length - 1;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (event.key.length === 1) {
          const match = options.findIndex((option) =>
            String(option.label).toLowerCase().startsWith(event.key.toLowerCase()),
          );
          if (match !== -1) setActiveIndex(match);
        }
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex h-8 w-full items-center justify-between gap-1 rounded-full border border-border bg-surface px-2.5 text-xs whitespace-nowrap disabled:opacity-60",
          "transition-[border-color,box-shadow] duration-200 hover:border-subtle",
          open && "border-subtle shadow-soft",
        )}
      >
        <span className="truncate">
          {prefix && (
            <span className={cn("mr-1 text-muted", prefixClassName)}>{prefix}</span>
          )}
          <span className="font-semibold">
            {selected?.triggerLabel ?? selected?.label ?? "Select"}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0 text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <ul
        id={listboxId}
        role="listbox"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "absolute z-50 max-h-64 w-max min-w-full overflow-y-auto rounded-2xl border border-border bg-surface p-1 shadow-lifted scrollbar-thin",
          // display:none when closed so the hidden list never adds scroll
          // overflow to its container; @starting-style + allow-discrete keep
          // both the open and close animations.
          "transition-[opacity,scale,display] transition-discrete duration-200 ease-out-soft",
          placement === "bottom"
            ? "top-full mt-2 origin-top"
            : "bottom-full mb-2 origin-bottom",
          align === "start" ? "left-0" : "right-0",
          open
            ? "block scale-100 opacity-100 starting:scale-95 starting:opacity-0"
            : "hidden scale-95 opacity-0",
        )}
      >
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          return (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={isSelected}
              onPointerEnter={() => setActiveIndex(index)}
              onClick={() => commit(index)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2 text-xs whitespace-nowrap",
                index === activeIndex && "bg-surface-sunken",
                isSelected && "font-semibold",
              )}
            >
              <span className="flex flex-col">
                {option.label}
                {option.description && (
                  <span className="font-normal text-muted">
                    {option.description}
                  </span>
                )}
              </span>
              {isSelected && (
                <Check className="size-3.5 text-accent" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
