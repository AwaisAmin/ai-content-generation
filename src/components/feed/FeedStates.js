import { CloudOff, RotateCw, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

/** Placeholder rows shaped like real generations, so nothing jumps on load. */
export function FeedSkeleton({ rows = 2 }) {
  return (
    <div aria-hidden="true" className="space-y-6">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid gap-3 @3xl/feed:grid-cols-[220px_minmax(0,1fr)] @6xl/feed:grid-cols-[260px_minmax(0,1fr)]">
          <Skeleton className="h-32 @3xl/feed:h-auto" />
          <div className="grid grid-cols-2 gap-3 @lg/feed:grid-cols-4">
            {Array.from({ length: 4 }, (_, cell) => (
              <Skeleton key={cell} className="aspect-3/4 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeedError({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-sunken text-muted">
        <CloudOff className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">Couldn&apos;t load your generations</p>
        <p className="text-sm text-muted">{message}</p>
      </div>
      <Button variant="secondary" icon={RotateCw} onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

const EMPTY_COPY = {
  image: ["No images yet", "Describe a scene in the panel and your images will land here."],
  video: ["No videos yet", "Describe a scene and a camera move to create your first clip."],
  all: ["Your canvas is empty", "Describe anything in the panel — your creations will land here."],
};

export function FeedEmpty({ feedType }) {
  const [title, body] = EMPTY_COPY[feedType ?? "all"];
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border px-6 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-3xl bg-accent-soft text-accent-text">
        <Sparkles className="size-6" aria-hidden="true" />
      </span>
      <div className="max-w-xs space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted">{body}</p>
      </div>
    </div>
  );
}
