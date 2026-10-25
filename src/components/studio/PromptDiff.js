import { diffWords } from "@/lib/diff";
import { cn } from "@/lib/cn";

/**
 * Renders `after` with the changes from `before` marked inline: additions
 * highlighted, removals struck through. Uses <ins>/<del> so the meaning
 * survives without colour and is announced by screen readers.
 */
export default function PromptDiff({ before, after, className }) {
  const parts = diffWords(before, after);

  return (
    <p className={cn("text-[13px] leading-relaxed", className)}>
      {parts.map((part, index) => {
        if (part.type === "added") {
          return (
            <ins
              key={index}
              className="rounded-sm bg-accent-soft px-0.5 text-accent-text no-underline decoration-clone"
            >
              {part.text}
            </ins>
          );
        }
        if (part.type === "removed") {
          return (
            <del key={index} className="text-muted decoration-muted/70">
              {part.text}
            </del>
          );
        }
        return <span key={index}>{part.text}</span>;
      })}
    </p>
  );
}
