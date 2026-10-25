"use client";

import { memo } from "react";
import MediaTile from "@/components/feed/MediaTile";
import PromptCard from "@/components/feed/PromptCard";
import { cn } from "@/lib/cn";

/**
 * One feed row: the prompt card beside its outputs. Images sit four to a
 * row so every generation keeps the same rhythm; videos get two wider
 * columns. Memoised so paging in more rows doesn't re-render existing ones.
 */
function GenerationGroup({ generation, highlighted, eager, onOpen, onReuse }) {
  const headingId = `generation-${generation.id}-heading`;
  const isVideo = generation.type === "video";

  return (
    <article
      id={`generation-${generation.id}`}
      aria-labelledby={headingId}
      className={cn(
        "grid scroll-mt-24 gap-3 rounded-[1.6rem] transition-[opacity,translate] duration-500 ease-out-soft starting:translate-y-3 starting:opacity-0 md:scroll-mt-[calc(5rem+92px+2rem)] @3xl/feed:grid-cols-[220px_minmax(0,1fr)] @6xl/feed:grid-cols-[260px_minmax(0,1fr)]",
        highlighted && "animate-highlight",
      )}
    >
      <PromptCard generation={generation} headingId={headingId} onReuse={onReuse} />

      <div
        className={cn(
          "grid content-start gap-3",
          isVideo ? "@lg/feed:grid-cols-2" : "grid-cols-2 @lg/feed:grid-cols-4",
        )}
      >
        {generation.outputs.map((output, index) => (
          <MediaTile
            key={output.id}
            output={output}
            aspectRatio={generation.aspectRatio}
            eager={eager}
            onOpen={() => onOpen(generation, index)}
          />
        ))}
      </div>
    </article>
  );
}

export default memo(GenerationGroup);
