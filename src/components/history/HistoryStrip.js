"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import HistoryThumbnail from "@/components/history/HistoryThumbnail";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Skeleton from "@/components/ui/Skeleton";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { cn } from "@/lib/cn";

const SKELETON_COUNT = 14;
const FADE = "40px";

function edgeMask(atStart, atEnd) {
  const start = atStart ? "#000" : "transparent";
  const end = atEnd ? "#000" : "transparent";
  return `linear-gradient(to right, ${start} 0, #000 ${FADE}, #000 calc(100% - ${FADE}), ${end} 100%)`;
}

export default function HistoryStrip() {
  const { history, retryHistory } = useWorkspace();
  const { status, items, error } = history;
  const { ref, atStart, atEnd, scrollByPage } = useHorizontalScroll(
    `${status}:${items.length}`,
  );

  return (
    <section
      aria-labelledby="history-heading"
      className="flex items-center gap-2 rounded-card bg-surface p-2 shadow-lifted md:gap-3 md:p-3"
    >
      <div className="flex size-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-border md:size-[68px]">
        <h2 id="history-heading" className="text-[13px] font-semibold md:text-sm">
          History
        </h2>
        <Link
          href="/assets"
          className="rounded text-[10px] text-muted transition-colors hover:text-accent"
        >
          View All
        </Link>
      </div>

      <span aria-hidden="true" className="h-8 w-1 shrink-0 rounded-full bg-surface-sunken" />

      <div className="group relative min-w-0 flex-1">
        <div
          ref={ref}
          aria-busy={status === "loading"}
          className="snap-x overflow-x-auto scrollbar-none"
          style={{ maskImage: edgeMask(atStart, atEnd) }}
        >
          {status === "loading" && (
            <ul className="flex gap-2.5 md:gap-3">
              <li className="sr-only">Loading history…</li>
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <li key={index} className="shrink-0">
                  <Skeleton className="size-16 rounded-xl md:size-[68px]" />
                </li>
              ))}
            </ul>
          )}

          {status === "success" && items.length > 0 && (
            <ul className="flex gap-2.5 py-1 md:gap-3">
              {items.map((item) => (
                <HistoryThumbnail key={item.id} item={item} />
              ))}
            </ul>
          )}

          {status === "success" && items.length === 0 && (
            <p className="px-2 text-sm text-muted">
              Your creations will appear here as you generate.
            </p>
          )}

          {status === "error" && (
            <div role="alert" className="flex items-center gap-3 px-2">
              <p className="text-sm text-muted">{error}</p>
              <Button variant="secondary" size="sm" icon={RotateCw} onClick={retryHistory}>
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Mouse affordance only — keyboard users tab through the links. */}
        {status === "success" && (
          <>
            <IconButton
              icon={ChevronLeft}
              label="Scroll history left"
              variant="surface"
              size="sm"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => scrollByPage(-1)}
              className={cn(
                "absolute top-1/2 left-1 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 max-md:hidden",
                atStart && "invisible",
              )}
            />
            <IconButton
              icon={ChevronRight}
              label="Scroll history right"
              variant="surface"
              size="sm"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => scrollByPage(1)}
              className={cn(
                "absolute top-1/2 right-1 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 max-md:hidden",
                atEnd && "invisible",
              )}
            />
          </>
        )}
      </div>
    </section>
  );
}
