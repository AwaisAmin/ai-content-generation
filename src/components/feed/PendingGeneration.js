"use client";

import { AlertTriangle, Image as ImageIcon, RotateCw, Video, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { ESTIMATED_DURATION_MS, MODELS, getAspectRatio } from "@/config/generation";
import { cn } from "@/lib/cn";

/**
 * Placeholder for a generation in flight — same layout as a finished row,
 * so the result replaces it without a jump. Shows the error and recovery
 * actions if the request fails.
 */
export default function PendingGeneration({ job, onCancel, onRetry, onDismiss }) {
  const { settings, status, error } = job;
  const isVideo = settings.type === "video";
  const isFailed = status === "failed";
  const ratio = getAspectRatio(settings.aspectRatio);
  const modelLabel = MODELS[settings.type].find((m) => m.value === settings.model)?.label;
  const TypeIcon = isVideo ? Video : ImageIcon;
  const headingId = `${job.id}-heading`;

  return (
    <article
      id={job.id}
      aria-labelledby={headingId}
      aria-busy={!isFailed}
      className="grid scroll-mt-24 gap-3 transition-[opacity,translate] duration-500 ease-out-soft starting:-translate-y-2 starting:opacity-0 md:scroll-mt-[calc(5rem+92px+2rem)] @3xl/feed:grid-cols-[220px_minmax(0,1fr)] @6xl/feed:grid-cols-[260px_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-3 rounded-card bg-surface-muted p-4">
        <h2
          id={headingId}
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium",
            isFailed ? "text-danger" : "text-accent",
          )}
        >
          {isFailed ? (
            <AlertTriangle className="size-3.5" aria-hidden="true" />
          ) : (
            <TypeIcon className="size-3.5 animate-pulse" aria-hidden="true" />
          )}
          {isFailed ? "Generation failed" : `Generating ${settings.count} ${settings.type}${settings.count > 1 ? "s" : ""}…`}
        </h2>

        <p className="line-clamp-3 text-[12.5px] sm:line-clamp-5 leading-relaxed text-foreground/70">
          {settings.prompt}
        </p>

        {!isFailed && (
          <div
            className="h-1 overflow-hidden rounded-full bg-surface-sunken"
            role="progressbar"
            aria-label="Generation progress"
            aria-valuetext="In progress"
          >
            <div
              className="h-full animate-progress rounded-full bg-accent"
              style={{ "--eta": `${ESTIMATED_DURATION_MS[settings.type]}ms` }}
            />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          {isFailed ? (
            <Button variant="ghost" size="sm" icon={X} onClick={() => onDismiss(job.id)}>
              Dismiss
            </Button>
          ) : (
            <Button variant="ghost" size="sm" icon={X} onClick={() => onCancel(job.id)}>
              Cancel
            </Button>
          )}
          <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-medium shadow-soft">
            {modelLabel}
          </span>
        </div>
      </div>

      {isFailed ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-danger/40 bg-danger/5 p-6 text-center"
        >
          <p className="max-w-sm text-sm text-foreground/80">{error}</p>
          <Button variant="secondary" size="sm" icon={RotateCw} onClick={() => onRetry(job)}>
            Try again
          </Button>
        </div>
      ) : (
        <div className={cn("grid content-start gap-3", isVideo ? "@lg/feed:grid-cols-2" : "grid-cols-2 @lg/feed:grid-cols-4")}>
          {Array.from({ length: settings.count }, (_, index) => (
            <Skeleton
              key={index}
              className="rounded-2xl"
              style={{ aspectRatio: `${ratio.width} / ${ratio.height}` }}
            />
          ))}
        </div>
      )}
    </article>
  );
}
