"use client";

import Select from "@/components/ui/Select";
import { MODELS, OUTPUT_COUNTS, getAspectRatios } from "@/config/generation";

/** Output count, aspect ratio and model — the settings changed most often. */
export default function GenerationOptions({ settings, update }) {
  const { type } = settings;
  const ratios = getAspectRatios(type);
  const countOptions = OUTPUT_COUNTS[type].map((count) => ({
    value: count,
    label: `${count} ${type}${count > 1 ? "s" : ""}`,
    triggerLabel: String(count),
  }));

  return (
    // Container query: the "Model:" prefix only shows when the row is wide
    // enough to fit it without truncating the model name.
    <div className="@container grid grid-cols-[auto_auto_minmax(0,1fr)] gap-1.5">
      <Select
        label="Number of outputs"
        prefix="#"
        value={settings.count}
        options={countOptions}
        onChange={(value) => update("count", value)}
      />
      <Select
        label="Aspect ratio"
        value={settings.aspectRatio}
        options={ratios}
        disabled={ratios.length === 1}
        onChange={(value) => update("aspectRatio", value)}
      />
      <Select
        label="Model"
        prefix="Model:"
        prefixClassName="hidden @[16.5rem]:inline"
        value={settings.model}
        options={MODELS[type]}
        align="end"
        onChange={(value) => update("model", value)}
      />
    </div>
  );
}
