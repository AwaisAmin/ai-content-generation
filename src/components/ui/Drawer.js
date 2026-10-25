"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

const SIDES = {
  left: "mr-auto h-dvh max-h-none w-[min(340px,88vw)] starting:-translate-x-full",
  right: "ml-auto h-dvh max-h-none w-[min(360px,92vw)] starting:translate-x-full",
  bottom: "mt-auto max-h-[88dvh] w-full max-w-none rounded-t-panel starting:translate-y-full",
  center: "m-auto max-h-[85dvh] w-[min(440px,92vw)] rounded-panel starting:scale-95 starting:opacity-0",
};

/**
 * Panel on a native modal <dialog>: focus trap, Escape, inert page and
 * focus return come from the platform. Content only mounts while open.
 */
export default function Drawer({ open, onClose, side = "left", title, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && ref.current.close()}
      className={cn(
        "overflow-hidden border-0 bg-surface-muted p-0 text-foreground shadow-lifted backdrop:bg-black/40 backdrop:backdrop-blur-[2px]",
        "transition-[translate,scale,opacity] duration-300 ease-out-soft",
        SIDES[side],
      )}
    >
      {open && (
        <div className="flex h-full max-h-[inherit] flex-col">
          {/* A <div>, not <header>: inside a dialog a header would become a
              second page-level "banner" landmark. */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
            <h2 className="text-sm font-semibold">{title}</h2>
            <IconButton icon={X} label="Close" size="sm" onClick={() => ref.current.close()} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
        </div>
      )}
    </dialog>
  );
}
