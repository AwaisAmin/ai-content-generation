import { STYLES } from "@/config/generation";
import { summarizeDiff } from "@/lib/diff";

const styleLabel = (value) => STYLES.find((style) => style.value === value)?.label ?? value;

/**
 * One-line description of what a version changed relative to its parent,
 * e.g. "+ golden hour, warm autumn tones" or "Style → Neon noir".
 */
export function describeChange(version, parent) {
  if (!parent) return "Starting point";
  if (version.operation === "vary") return "New seed, same prompt";

  const { added, removed } = summarizeDiff(parent.prompt, version.prompt);
  const changes = [];
  if (version.style !== parent.style) changes.push(`Style → ${styleLabel(version.style)}`);
  if (version.aspectRatio !== parent.aspectRatio) changes.push(version.aspectRatio);
  if (added.length) changes.push(`+ ${added.join(", ")}`);
  else if (removed.length) changes.push(`− ${removed.join(", ")}`);

  return changes.join(" · ") || "Same prompt";
}
