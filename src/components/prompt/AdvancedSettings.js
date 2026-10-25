"use client";

import { useId } from "react";
import { Dices } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { GUIDANCE_RANGE, SEED_MAX } from "@/config/generation";

const fieldLabel = "text-xs font-medium";
const fieldInput =
  "w-full rounded-xl border border-border bg-surface-muted px-3 py-2 text-xs outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus:border-subtle focus:ring-4 focus:ring-accent/15";

export default function AdvancedSettings({ settings, update }) {
  const id = useId();

  function handleSeedChange(event) {
    const digits = event.target.value.replace(/\D/g, "");
    update("seed", digits && String(Math.min(Number(digits), SEED_MAX)));
  }

  return (
    <div className="space-y-4 pt-1 text-left">
      <div className="space-y-1.5">
        <label htmlFor={`${id}-negative`} className={fieldLabel}>
          Negative prompt
        </label>
        <textarea
          id={`${id}-negative`}
          rows={2}
          value={settings.negativePrompt}
          onChange={(event) => update("negativePrompt", event.target.value)}
          placeholder="Things to avoid, e.g. blur, extra fingers, text"
          className={`${fieldInput} resize-none`}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={`${id}-guidance`} className={fieldLabel}>
            Prompt guidance
          </label>
          <output htmlFor={`${id}-guidance`} className="text-xs text-muted tabular-nums">
            {settings.guidance}
          </output>
        </div>
        <input
          id={`${id}-guidance`}
          type="range"
          min={GUIDANCE_RANGE.min}
          max={GUIDANCE_RANGE.max}
          step={GUIDANCE_RANGE.step}
          value={settings.guidance}
          onChange={(event) => update("guidance", Number(event.target.value))}
          aria-describedby={`${id}-guidance-hint`}
          className="w-full accent-accent"
        />
        <p id={`${id}-guidance-hint`} className="flex justify-between text-[10px] text-subtle">
          <span>Creative</span>
          <span>Precise</span>
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${id}-seed`} className={fieldLabel}>
          Seed
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-seed`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={settings.seed}
            onChange={handleSeedChange}
            placeholder="Random"
            aria-describedby={`${id}-seed-hint`}
            className={`${fieldInput} tabular-nums`}
          />
          <IconButton
            icon={Dices}
            label="Random seed"
            variant="surface"
            onClick={() => update("seed", String(Math.floor(Math.random() * SEED_MAX)))}
          />
        </div>
        <p id={`${id}-seed-hint`} className="text-[10px] text-subtle">
          Reuse a seed to get consistent results. Leave empty for random.
        </p>
      </div>
    </div>
  );
}
