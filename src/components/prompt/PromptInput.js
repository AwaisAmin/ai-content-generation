"use client";

import { useId } from "react";
import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { MAX_CONCURRENT_GENERATIONS, PROMPT_MAX_LENGTH } from "@/config/generation";
import { useIsMac } from "@/hooks/useIsMac";
import { cn } from "@/lib/cn";

const COUNTER_THRESHOLD = PROMPT_MAX_LENGTH * 0.8;

/**
 * The prompt card: an auto-growing textarea with the Generate button docked
 * inside it. Ctrl/⌘ + Enter submits from the keyboard.
 */
export default function PromptInput({
  ref,
  value,
  onChange,
  placeholder,
  error,
  runningCount = 0,
  canGenerate = true,
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const isMac = useIsMac();
  const showCounter = value.length >= COUNTER_THRESHOLD;
  const limitMessage = `${MAX_CONCURRENT_GENERATIONS} generations are running — Generate unlocks when one finishes.`;

  function handleKeyDown(event) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div>
      <div
        className={cn(
          "relative rounded-3xl border-[1.5px] bg-surface shadow-soft transition-[border-color,box-shadow] duration-200",
          "focus-within:ring-4 focus-within:ring-accent/15",
          error ? "border-danger" : "border-border-strong",
        )}
      >
        <label htmlFor={id} className="sr-only">
          Prompt
        </label>
        <textarea
          ref={ref}
          id={id}
          name="prompt"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={PROMPT_MAX_LENGTH}
          rows={5}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="block max-h-72 min-h-36 w-full resize-none bg-transparent px-4 pt-4 pb-16 text-[13px] leading-relaxed outline-none scrollbar-thin [field-sizing:content] placeholder:text-muted"
        />

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <span className="pl-1 text-[11px] text-subtle" aria-live="polite">
            {showCounter ? (
              <span className={cn(value.length >= PROMPT_MAX_LENGTH && "text-danger")}>
                {value.length} / {PROMPT_MAX_LENGTH}
              </span>
            ) : runningCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-accent">
                <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
                {runningCount} generating…
              </span>
            ) : (
              <kbd className="hidden font-sans md:inline">
                {isMac ? "⌘" : "Ctrl"} + Enter
              </kbd>
            )}
          </span>

          <Button
            type="submit"
            icon={Sparkles}
            loading={!canGenerate}
            title={canGenerate ? undefined : limitMessage}
            className="pointer-events-auto [&>svg]:transition-transform [&>svg]:duration-500 [&>svg]:ease-spring hover:[&>svg]:scale-110 hover:[&>svg]:rotate-[20deg]"
          >
            {canGenerate ? "Generate" : "Busy"}
          </Button>
        </div>
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-2 px-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
