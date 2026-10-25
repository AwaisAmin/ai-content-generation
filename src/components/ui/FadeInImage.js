"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * `next/image` that fades in once decoded instead of popping in line by
 * line. Place it in a container with a placeholder background.
 */
export default function FadeInImage({ className, onLoad, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- alt is passed through props
    <Image
      {...props}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={cn(
        "transition-[opacity,scale] duration-500 ease-(--ease-out-soft)",
        loaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0",
        className,
      )}
    />
  );
}
