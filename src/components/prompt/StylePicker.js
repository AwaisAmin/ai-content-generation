"use client";

import { useId } from "react";
import Image from "next/image";
import { Ban, Check } from "lucide-react";
import { STYLES } from "@/config/generation";

/**
 * Visual style presets. Built on native radio inputs, so arrow-key
 * navigation and form semantics come for free.
 */
export default function StylePicker({ value, onChange }) {
  const name = useId();

  return (
    <fieldset>
      <legend className="sr-only">Style</legend>
      <div className="grid grid-cols-3 gap-2 pt-1">
        {STYLES.map((style) => (
          <label
            key={style.value}
            className="group/style flex cursor-pointer flex-col items-center gap-1.5 text-[11px] font-medium"
          >
            <input
              type="radio"
              name={name}
              value={style.value}
              checked={value === style.value}
              onChange={() => onChange(style.value)}
              className="peer sr-only"
            />
            <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface-sunken ring-offset-2 ring-offset-surface transition-[box-shadow,translate] duration-200 group-hover/style:-translate-y-0.5 peer-checked:ring-2 peer-checked:ring-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
              {style.preview ? (
                <Image
                  src={style.preview}
                  alt=""
                  fill
                  sizes="80px"
                  quality={60}
                  className="object-cover transition-transform duration-500 ease-out-soft group-hover/style:scale-110"
                />
              ) : (
                <Ban className="absolute inset-0 m-auto size-5 text-muted" aria-hidden="true" />
              )}
              {value === style.value && (
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-soft">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="text-muted transition-colors peer-checked:text-foreground">
              {style.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
