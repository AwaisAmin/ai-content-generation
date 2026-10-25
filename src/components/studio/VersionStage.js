"use client";

import Image from "next/image";
import { Download, Star } from "lucide-react";
import OperationBadge from "@/components/studio/OperationBadge";
import { useStudio } from "@/components/studio/StudioProvider";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { getAspectRatio } from "@/config/generation";
import { cn } from "@/lib/cn";
import { downloadFile, outputFilename } from "@/lib/download";
import { formatRelativeTime } from "@/lib/format";

/**
 * The selected version, big. Its hero output fills the stage; the strip
 * below picks which output represents the version in the tree.
 */
export default function VersionStage({ className, children }) {
  const { selected: version, patchVersion } = useStudio();
  const hero = version.outputs[version.heroIndex] ?? version.outputs[0];
  const ratio = getAspectRatio(version.aspectRatio);

  return (
    <section aria-labelledby="stage-heading" className={cn("flex min-h-0 flex-col", className)}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 pt-4 pb-3">
        <h2 id="stage-heading" className="text-lg font-semibold tracking-tight">
          {version.id}
        </h2>
        <OperationBadge operation={version.operation} />
        <time dateTime={version.createdAt} className="text-xs text-muted">
          {formatRelativeTime(version.createdAt)}
        </time>

        <div className="ml-auto flex items-center gap-2">
          <IconButton
            icon={Download}
            label="Download hero image"
            variant="surface"
            size="sm"
            onClick={() => downloadFile(hero.src, outputFilename(hero))}
          />
          <Button
            variant={version.starred ? "primary" : "secondary"}
            size="sm"
            icon={Star}
            aria-pressed={version.starred}
            onClick={() => patchVersion(version.id, { starred: !version.starred })}
            className={cn(version.starred && "[&>svg]:fill-current")}
          >
            {version.starred ? "Selected" : "Select"}
          </Button>
        </div>
      </header>

      {/* Hero: as large as the stage allows at its own ratio. The stage is a
          size container, so the width is min(stage width, stage height × ratio). */}
      <div className="relative mx-5 min-h-0 flex-1" style={{ containerType: "size" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative overflow-hidden rounded-[1.5rem] bg-surface-sunken shadow-lifted"
            style={{
              aspectRatio: `${ratio.width} / ${ratio.height}`,
              width: `min(100cqw, 100cqh * ${ratio.width} / ${ratio.height})`,
            }}
          >
            <Image
              key={hero.id}
              src={hero.src}
              alt={hero.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={90}
              preload
              className="object-cover transition-opacity duration-300 starting:opacity-0"
            />
          </div>
        </div>
      </div>

      <fieldset className="px-5 pt-3 pb-4">
        <legend className="sr-only">Choose the hero output for {version.id}</legend>
        <div className="flex justify-center gap-2">
          {version.outputs.map((output, index) => (
            <label key={output.id} className="group/out relative cursor-pointer">
              <input
                type="radio"
                name={`hero-${version.id}`}
                checked={index === version.heroIndex}
                onChange={() => patchVersion(version.id, { heroIndex: index })}
                className="peer sr-only"
              />
              <span className="sr-only">{output.alt}</span>
              <span
                aria-hidden="true"
                className="block size-14 overflow-hidden rounded-xl bg-surface-sunken opacity-70 ring-offset-2 ring-offset-background transition-[opacity,box-shadow,translate] duration-200 group-hover/out:-translate-y-0.5 group-hover/out:opacity-100 peer-checked:opacity-100 peer-checked:ring-2 peer-checked:ring-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
              >
                <Image
                  src={output.src}
                  alt=""
                  width={56}
                  height={56}
                  sizes="56px"
                  quality={60}
                  className="size-full object-cover"
                />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {children}
    </section>
  );
}
