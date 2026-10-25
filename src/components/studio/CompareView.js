"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeftRight, Check } from "lucide-react";
import CompareSlider from "@/components/studio/CompareSlider";
import PromptDiff from "@/components/studio/PromptDiff";
import { useStudio } from "@/components/studio/StudioProvider";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import { MODELS, STYLES, getAspectRatio } from "@/config/generation";

const MODES = [
  { value: "side", label: "Side by side" },
  { value: "slider", label: "Slider" },
];

const SETTINGS = [
  { key: "model", label: "Model", format: (v) => MODELS.image.find((m) => m.value === v)?.label ?? v },
  { key: "aspectRatio", label: "Ratio" },
  { key: "style", label: "Style", format: (v) => STYLES.find((s) => s.value === v)?.label ?? v },
  { key: "seed", label: "Seed" },
];

const heroOf = (version) => version.outputs[version.heroIndex] ?? version.outputs[0];

/** A framed image at its own ratio, as large as its (size-container) cell allows. */
function Frame({ version, label }) {
  const ratio = getAspectRatio(version.aspectRatio);
  const hero = heroOf(version);
  return (
    <figure className="relative min-h-0" style={{ containerType: "size" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative overflow-hidden rounded-[1.25rem] bg-surface-sunken shadow-lifted"
          style={{
            aspectRatio: `${ratio.width} / ${ratio.height}`,
            width: `min(100cqw, 100cqh * ${ratio.width} / ${ratio.height})`,
          }}
        >
          <Image src={hero.src} alt={hero.alt} fill sizes="(min-width: 1024px) 30vw, 50vw" quality={85} className="object-cover" />
          <figcaption className="absolute top-2.5 left-2.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {label}
          </figcaption>
        </div>
      </div>
    </figure>
  );
}

/**
 * Compares the selection (A) with another version (B): images side by side
 * or under a reveal slider, plus exactly what changed in prompt and settings.
 */
export default function CompareView() {
  const { selected: a, compared: b, tree, select, compare } = useStudio();
  const [mode, setMode] = useState("side");
  const changedSettings = SETTINGS.filter(({ key }) => a[key] !== b[key]);
  // Differences always read oldest → newest, whichever side is A.
  const [from, to] = a.createdAt <= b.createdAt ? [a, b] : [b, a];
  const options = tree.rows
    .map((row) => row.version)
    .filter((version) => !version.pending && version.id !== a.id)
    .map((version) => ({ value: version.id, label: version.id }));
  const ratioA = getAspectRatio(a.aspectRatio);
  const ratioB = getAspectRatio(b.aspectRatio);
  const sameRatio = a.aspectRatio === b.aspectRatio;

  // Escape leaves compare mode (unless a menu inside claimed it).
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !event.defaultPrevented) compare(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [compare]);

  return (
    <div className="flex flex-col lg:min-h-0 lg:flex-1">
      <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
        <span className="text-sm font-medium">
          A · {a.id}
        </span>
        <IconButton
          icon={ArrowLeftRight}
          label={`Swap: make ${b.id} A`}
          size="sm"
          variant="surface"
          onClick={() => select(b.id)}
        />
        <Select
          label="Compare with"
          prefix="B ·"
          value={b.id}
          options={options}
          onChange={compare}
        />
        <SegmentedControl
          label="Compare view"
          value={mode}
          onChange={setMode}
          options={MODES}
          className="w-56 max-sm:w-full sm:ml-auto"
        />
        <Button size="sm" icon={Check} onClick={() => compare(null)}>
          Done
        </Button>
      </div>

      <div className="relative mx-5 h-[min(55dvh,520px)] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
        {mode === "side" ? (
          <div className="grid size-full grid-cols-2 gap-4">
            <Frame version={a} label={`A · ${a.id}`} />
            <Frame version={b} label={`B · ${b.id}`} />
          </div>
        ) : (
          <div className="size-full" style={{ containerType: "size" }}>
            <div className="flex size-full items-center justify-center">
              <div
                style={{
                  aspectRatio: `${ratioA.width} / ${ratioA.height}`,
                  width: `min(100cqw, 100cqh * ${ratioA.width} / ${ratioA.height})`,
                }}
              >
                <CompareSlider a={heroOf(a)} b={heroOf(b)} labelA={a.id} labelB={b.id} />
              </div>
            </div>
          </div>
        )}
      </div>

      <section aria-label="Differences" className="mx-5 mt-4 mb-5 rounded-panel border border-border bg-surface p-4 shadow-soft">
        <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
          Prompt · {from.id} → {to.id}
        </h3>
        {from.prompt === to.prompt ? (
          <p className="text-xs text-muted">
            {changedSettings.length
              ? `Identical prompts — the difference comes from the ${changedSettings
                  .map(({ label }) => label.toLowerCase())
                  .join(", ")}.`
              : "Identical prompts and settings."}
          </p>
        ) : (
          <PromptDiff before={from.prompt} after={to.prompt} className="text-xs" />
        )}

        {changedSettings.length > 0 && (
          <dl className="mt-3 flex flex-wrap gap-2">
            {changedSettings.map(({ key, label, format = (v) => v }) => (
              <div key={key} className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-[11px]">
                <dt className="text-muted">{label}</dt>
                <dd className="font-medium">
                  <del className="text-muted">{format(from[key])}</del>
                  <span aria-hidden="true" className="mx-1 text-muted">→</span>
                  <ins className="text-accent-text no-underline">{format(to[key])}</ins>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {mode === "slider" && !sameRatio && (
          <p className="mt-3 text-[11px] text-muted">
            {b.id} is {ratioB.label}; it&apos;s cropped to {a.id}&apos;s {ratioA.label} frame in the slider.
          </p>
        )}
      </section>
    </div>
  );
}
