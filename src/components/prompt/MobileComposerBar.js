"use client";

import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * Mobile-only prompt bar, docked above the tab bar within thumb reach.
 * Tapping the text opens the full composer sheet; the button generates
 * straight away when there's already a prompt.
 */
export default function MobileComposerBar({
  prompt,
  placeholder,
  runningCount,
  canGenerate,
  expanded,
  onOpen,
  onGenerate,
}) {
  return (
    <div className="fixed inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 md:hidden">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface/95 p-1.5 pl-2 shadow-lifted backdrop-blur-xl">
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-2 py-2 text-left text-sm"
        >
          {runningCount > 0 && (
            <span className="relative flex size-2 shrink-0" aria-hidden="true">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
              <span className="relative size-2 rounded-full bg-accent" />
            </span>
          )}
          <span className={prompt ? "truncate" : "truncate text-muted"}>
            {prompt || placeholder}
          </span>
          {runningCount > 0 && <span className="sr-only">({runningCount} generating)</span>}
        </button>

        <Button
          icon={Sparkles}
          loading={!canGenerate}
          onClick={onGenerate}
          aria-label="Generate"
          className="size-10 px-0"
        />
      </div>
    </div>
  );
}
