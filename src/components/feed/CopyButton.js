"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import IconButton from "@/components/ui/IconButton";

const RESET_MS = 1500;

/** Copies `text` and confirms with a check mark (announced to screen readers). */
export default function CopyButton({ text, label = "Copy prompt", className }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      // Clipboard can be blocked (permissions / insecure context); no-op.
    }
  }

  return (
    <>
      <IconButton
        icon={copied ? Check : Copy}
        label={copied ? "Copied" : label}
        size="sm"
        variant={copied ? "active" : "ghost"}
        onClick={copy}
        className={className}
      />
      <span className="sr-only" aria-live="polite">
        {copied ? "Prompt copied to clipboard" : ""}
      </span>
    </>
  );
}
