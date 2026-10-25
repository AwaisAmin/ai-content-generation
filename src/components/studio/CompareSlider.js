"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";

/**
 * Before/after slider. A transparent range input covers the frame, so
 * dragging, tapping and arrow keys all move the divider with no custom
 * pointer code — and it's announced as a slider to screen readers.
 */
export default function CompareSlider({ a, b, labelA, labelB }) {
  const [position, setPosition] = useState(50);

  return (
    <div className="group/slider relative size-full overflow-hidden rounded-[1.5rem] bg-surface-sunken shadow-lifted has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ring">
      <Image src={b.src} alt={b.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" quality={90} className="object-cover" />

      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={a.src} alt={a.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" quality={90} className="object-cover" />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%` }}>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white/90 shadow-[0_0_8px_rgb(0_0_0/0.35)]" />
        <div className="absolute top-1/2 -left-4 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lifted">
          <ChevronsLeftRight className="size-4" />
        </div>
      </div>

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        A · {labelA}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        B · {labelB}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`Reveal ${labelA} (left) over ${labelB} (right)`}
        aria-valuetext={`${position}% ${labelA}`}
        className="absolute inset-0 size-full cursor-ew-resize appearance-none opacity-0"
      />
    </div>
  );
}
