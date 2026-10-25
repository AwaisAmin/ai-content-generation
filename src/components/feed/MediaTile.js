"use client";

import { useRef } from "react";
import { Download, Maximize2, Play } from "lucide-react";
import FadeInImage from "@/components/ui/FadeInImage";
import IconButton from "@/components/ui/IconButton";
import { getAspectRatio } from "@/config/generation";
import { cn } from "@/lib/cn";
import { downloadFile, outputFilename } from "@/lib/download";
import { formatDuration } from "@/lib/format";

// Approximate tile widths: the feed's container queries give 2 columns on
// phones / narrow feeds and 4 once the feed is wide enough.
const IMAGE_SIZES = "(min-width: 1280px) 18vw, (min-width: 768px) 25vw, 50vw";

/**
 * A single generated image or video. The whole tile opens the lightbox;
 * quick actions appear on hover / keyboard focus (always on touch screens).
 * Videos preview silently while hovered.
 */
export default function MediaTile({ output, aspectRatio, eager = false, onOpen }) {
  const videoRef = useRef(null);
  const isVideo = output.type === "video";
  const ratio = getAspectRatio(aspectRatio);

  function playPreview() {
    videoRef.current?.play().catch(() => {});
  }

  function stopPreview() {
    videoRef.current?.pause();
  }

  return (
    <figure
      className="group/tile relative overflow-hidden rounded-2xl bg-surface-sunken shadow-soft"
      style={{ aspectRatio: `${ratio.width} / ${ratio.height}` }}
      onPointerEnter={isVideo ? playPreview : undefined}
      onPointerLeave={isVideo ? stopPreview : undefined}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${isVideo ? "video" : "image"}: ${output.alt}`}
        className="absolute inset-0 block size-full cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-offset-[-3px]"
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={`${output.src}#t=0.1`}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="size-full object-cover"
          />
        ) : (
          <FadeInImage
            src={output.src}
            alt={output.alt}
            fill
            sizes={IMAGE_SIZES}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            className="object-cover duration-700 group-hover/tile:scale-[1.04]"
          />
        )}
      </button>

      {/* Scrim so the action buttons stay legible on bright images. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-focus-within/tile:opacity-100 group-hover/tile:opacity-100"
      />

      <div
        className={cn(
          "absolute top-2 right-2 flex gap-1.5 transition-[opacity,translate] duration-300 ease-out-soft",
          "-translate-y-1 opacity-0 group-focus-within/tile:translate-y-0 group-focus-within/tile:opacity-100 group-hover/tile:translate-y-0 group-hover/tile:opacity-100",
          "[@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100",
        )}
      >
        <IconButton
          icon={Download}
          label={`Download ${isVideo ? "video" : "image"}`}
          variant="surface"
          size="sm"
          onClick={() => downloadFile(output.src, outputFilename(output))}
        />
        <IconButton
          icon={Maximize2}
          label="Open full screen"
          variant="surface"
          size="sm"
          onClick={onOpen}
          className="max-sm:hidden"
        />
      </div>

      {isVideo && (
        <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          <Play className="size-2.5 fill-current" aria-hidden="true" />
          {formatDuration(output.duration)}
        </span>
      )}
    </figure>
  );
}
