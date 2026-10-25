"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { downloadFile, outputFilename } from "@/lib/download";

/**
 * Full-screen viewer for one generation's outputs, built on the native
 * <dialog>: showModal() gives focus trapping, Escape-to-close, an inert
 * page behind and a ::backdrop for free.
 */
export default function Lightbox({ generation, index, onIndexChange, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const output = generation.outputs[index];
  const total = generation.outputs.length;
  const isVideo = output.type === "video";

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    // showModal() focuses the first control (Download); Close is the
    // expected landing spot. The browser restores focus to the tile on close.
    closeRef.current?.focus();
    return () => dialog.close();
  }, []);

  function step(delta) {
    onIndexChange((index + delta + total) % total);
  }

  function handleKeyDown(event) {
    if (total < 2) return;
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${isVideo ? "Video" : "Image"} ${index + 1} of ${total}`}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
      // The dim layer lives on the dialog itself (not ::backdrop) so contrast
      // checkers and forced-colors mode see the real background behind text.
      className="m-auto h-dvh max-h-none w-dvw max-w-none bg-black/85 p-0 text-white backdrop:bg-transparent backdrop:backdrop-blur-md transition-[opacity,scale] duration-300 ease-out-soft starting:scale-[0.98] starting:opacity-0"
    >
      <div className="pointer-events-none flex h-full flex-col">
        <header className="pointer-events-auto flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <p className="text-sm text-white/70 tabular-nums" aria-live="polite">
            {index + 1} / {total}
          </p>
          <div className="flex gap-2">
            <IconButton
              icon={Download}
              label={`Download ${isVideo ? "video" : "image"}`}
              variant="surface"
              onClick={() => downloadFile(output.src, outputFilename(output))}
            />
            <IconButton
              ref={closeRef}
              icon={X}
              label="Close"
              variant="surface"
              onClick={() => dialogRef.current.close()}
            />
          </div>
        </header>

        <figure className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
          {isVideo ? (
            <video
              key={output.id}
              src={output.src}
              controls
              autoPlay
              loop
              playsInline
              className="pointer-events-auto max-h-full max-w-full rounded-2xl"
            >
              {output.alt}
            </video>
          ) : (
            <Image
              key={output.id}
              src={output.src}
              alt={output.alt}
              width={output.width}
              height={output.height}
              sizes="90vw"
              quality={90}
              className="pointer-events-auto max-h-full w-auto rounded-2xl object-contain"
            />
          )}

          {total > 1 && (
            <>
              <IconButton
                icon={ChevronLeft}
                label="Previous"
                variant="surface"
                size="lg"
                onClick={() => step(-1)}
                className="pointer-events-auto absolute left-2 md:left-6"
              />
              <IconButton
                icon={ChevronRight}
                label="Next"
                variant="surface"
                size="lg"
                onClick={() => step(1)}
                className="pointer-events-auto absolute right-2 md:right-6"
              />
            </>
          )}
        </figure>

        <figcaption className="mx-auto w-full max-w-3xl px-6 py-4 text-center text-xs leading-relaxed text-white/75">
          <span className="line-clamp-2">{generation.prompt}</span>
        </figcaption>
      </div>
    </dialog>
  );
}
