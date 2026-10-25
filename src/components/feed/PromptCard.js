"use client";

import { useId, useState } from "react";
import { Image as ImageIcon, RotateCcw, Video } from "lucide-react";
import CopyButton from "@/components/feed/CopyButton";
import IconButton from "@/components/ui/IconButton";
import { MODELS, STYLES } from "@/config/generation";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format";

// Prompts longer than this get clamped with a "Show more" toggle.
const CLAMP_THRESHOLD = 220;

/** The prompt and settings a generation was created with. */
export default function PromptCard({ generation, headingId, onReuse }) {
  const [expanded, setExpanded] = useState(false);
  const textId = useId();
  const { type, prompt, model, aspectRatio, style, createdAt } = generation;

  const isLong = prompt.length > CLAMP_THRESHOLD;
  const modelLabel = MODELS[type].find((m) => m.value === model)?.label ?? model;
  const styleLabel = style !== "none" && STYLES.find((s) => s.value === style)?.label;
  const TypeIcon = type === "video" ? Video : ImageIcon;

  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface-muted p-4">
      <h2 id={headingId} className="sr-only">
        {type === "video" ? "Video" : "Image"} generation, {formatRelativeTime(createdAt)}
      </h2>

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] whitespace-nowrap text-muted">
        <TypeIcon className="size-3.5" aria-hidden="true" />
        <time dateTime={createdAt}>{formatRelativeTime(createdAt)}</time>
        <span aria-hidden="true">·</span>
        <span>{aspectRatio}</span>
        {styleLabel && (
          <>
            <span aria-hidden="true">·</span>
            <span>{styleLabel}</span>
          </>
        )}
      </div>

      <div>
        <p
          id={textId}
          className={cn(
            "text-[12.5px] leading-relaxed text-foreground/85",
            isLong && !expanded && "line-clamp-3 sm:line-clamp-5 lg:line-clamp-8",
          )}
        >
          {prompt}
        </p>
        {isLong && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={textId}
            onClick={() => setExpanded((value) => !value)}
            className="mt-1 rounded text-[11px] font-medium text-accent-text hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex gap-0.5">
          <CopyButton text={prompt} />
          <IconButton
            icon={RotateCcw}
            label="Reuse prompt and settings"
            size="sm"
            onClick={() => onReuse(generation)}
          />
        </div>
        <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-medium shadow-soft">
          {modelLabel}
        </span>
      </div>
    </div>
  );
}
