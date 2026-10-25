"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { RotateCw } from "lucide-react";
import GenerationGroup from "@/components/feed/GenerationGroup";
import PendingGeneration from "@/components/feed/PendingGeneration";
import { FeedEmpty, FeedError, FeedSkeleton } from "@/components/feed/FeedStates";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import Button from "@/components/ui/Button";

// Only needed once someone opens an output — keep it out of the first load.
const Lightbox = dynamic(() => import("@/components/feed/Lightbox"), { ssr: false });

// Start fetching the next page well before the user reaches the end.
const PREFETCH_MARGIN = "800px";

export default function GenerationFeed() {
  const {
    feed,
    feedType,
    highlightedId,
    retryFeed,
    loadMore,
    jobs,
    cancelJob,
    retryJob,
    dismissJob,
    reuseGeneration,
    announcement,
  } = useWorkspace();
  const { status, items, nextCursor, error, isLoadingMore, loadMoreError } = feed;
  const [viewer, setViewer] = useState(null);
  const sentinelRef = useRef(null);

  const canAutoLoad = status === "success" && Boolean(nextCursor) && !loadMoreError;

  // Re-observed after every page (items.length): an observer only fires on
  // changes, so a sentinel still on screen after a short page would stall.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!canAutoLoad || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { rootMargin: PREFETCH_MARGIN },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canAutoLoad, loadMore, items.length]);

  // Bring a just-started generation into view (no-op if already visible).
  const newestJobId = jobs[0]?.id;
  useEffect(() => {
    if (!newestJobId) return;
    document
      .getElementById(newestJobId)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [newestJobId]);

  // Stable so memoised rows don't re-render when the viewer opens.
  const openViewer = useCallback(
    (generation, index) => setViewer({ generation, index }),
    [],
  );

  const liveRegion = (
    <p className="sr-only" role="status">
      {announcement}
    </p>
  );

  if (status === "loading") {
    return (
      <div aria-busy="true">
        <p className="sr-only" role="status">Loading your generations…</p>
        <FeedSkeleton />
      </div>
    );
  }

  if (status === "error") {
    return <FeedError message={error} onRetry={retryFeed} />;
  }

  if (items.length === 0 && jobs.length === 0) {
    return (
      <>
        {liveRegion}
        <FeedEmpty feedType={feedType} />
      </>
    );
  }

  return (
    <>
      {liveRegion}
      <div className="space-y-6" aria-busy={isLoadingMore}>
        {jobs.map((job) => (
          <PendingGeneration
            key={job.id}
            job={job}
            onCancel={cancelJob}
            onRetry={retryJob}
            onDismiss={dismissJob}
          />
        ))}
        {items.map((generation, index) => (
          <GenerationGroup
            key={generation.id}
            generation={generation}
            highlighted={generation.id === highlightedId}
            eager={index === 0}
            onOpen={openViewer}
            onReuse={reuseGeneration}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="pt-6">
        {isLoadingMore && <FeedSkeleton rows={1} />}

        {loadMoreError && (
          <div role="alert" className="flex items-center justify-center gap-3 py-4 text-sm text-muted">
            {loadMoreError}
            <Button variant="secondary" size="sm" icon={RotateCw} onClick={loadMore}>
              Retry
            </Button>
          </div>
        )}

        {!nextCursor && (
          <p className="py-6 text-center text-xs text-subtle">
            That&apos;s everything — you&apos;ve reached your first generation.
          </p>
        )}
      </div>

      {viewer && (
        <Lightbox
          generation={viewer.generation}
          index={viewer.index}
          onIndexChange={(index) => setViewer((current) => ({ ...current, index }))}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}
