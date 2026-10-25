"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Single collapsible section. Height animates via grid-template-rows
 * (0fr -> 1fr), which needs no JS measuring; collapsed content is `inert`
 * so it can't be tabbed into.
 */
export default function Accordion({
  title,
  meta,
  defaultOpen = false,
  children,
  className,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const buttonId = `${id}-trigger`;
  const panelId = `${id}-panel`;

  return (
    <div
      className={cn(
        "rounded-card bg-surface shadow-soft transition-shadow duration-200",
        open && "shadow-lifted",
        className,
      )}
    >
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="relative flex h-12 w-full items-center justify-center rounded-card px-12 text-[15px] font-medium"
        >
          {title}
          {meta && (
            <span className="ml-2 max-w-28 truncate rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
              {meta}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "absolute right-5 size-4 text-muted transition-transform duration-300 ease-out-soft",
              open && "rotate-180",
            )}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out-soft",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        {/* `relative` makes this the containing block for absolutely
            positioned children (e.g. sr-only inputs), so the clip applies
            to them too and they can't leak scroll height to ancestors. */}
        <div className="relative overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
