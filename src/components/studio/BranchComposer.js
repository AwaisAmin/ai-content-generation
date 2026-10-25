"use client";

import { useId, useState } from "react";
import { GitBranch, Loader2, RotateCw, X } from "lucide-react";
import PromptDiff from "@/components/studio/PromptDiff";
import { useStudio } from "@/components/studio/StudioProvider";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import {
  ASPECT_RATIOS,
  MAX_CONCURRENT_GENERATIONS,
  MODELS,
  OUTPUT_COUNTS,
  PROMPT_MAX_LENGTH,
  STYLES,
} from "@/config/generation";
import { BRANCH_OPERATIONS, OPERATIONS } from "@/config/studio";
import { cn } from "@/lib/cn";

const OPERATION_OPTIONS = BRANCH_OPERATIONS.map((value) => ({
  value,
  label: OPERATIONS[value].label,
  icon: OPERATIONS[value].icon,
}));

/**
 * Creates the next version from the selected one. Remounted per parent
 * (via `key`), so the draft always starts from that version's settings.
 * The live diff shows exactly what the new branch will change.
 */
export default function BranchComposer({ parent }) {
  const { branch, canBranch, jobs, retryJob, dismissJob, cancelJob } = useStudio();
  const [operation, setOperation] = useState("refine");
  const [prompt, setPrompt] = useState(parent.prompt);
  const [settings, setSettings] = useState({
    style: parent.style,
    model: parent.model,
    aspectRatio: parent.aspectRatio,
    count: parent.outputs.length || 4,
  });
  const promptId = useId();

  const isVary = operation === "vary";
  const isRemix = operation === "remix";
  const draftPrompt = isVary ? parent.prompt : prompt;
  const promptChanged = draftPrompt.trim() !== parent.prompt;
  const settingsChanged =
    settings.style !== parent.style ||
    settings.model !== parent.model ||
    settings.aspectRatio !== parent.aspectRatio;

  // Refine only makes sense with new words; Remix needs some change.
  const unchanged =
    (operation === "refine" && !promptChanged) || (isRemix && !promptChanged && !settingsChanged);
  const jobsHere = jobs.filter((job) => job.input.parentId === parent.id);
  const running = jobsHere.filter((job) => job.status === "running");
  const failed = jobsHere.filter((job) => job.status === "failed");

  const update = (field) => (value) => setSettings((current) => ({ ...current, [field]: value }));

  function handleSubmit(event) {
    event.preventDefault();
    if (unchanged || !canBranch || !draftPrompt.trim()) return;
    branch({
      parentId: parent.id,
      operation,
      prompt: draftPrompt.trim(),
      count: settings.count,
      ...(isRemix
        ? { style: settings.style, model: settings.model, aspectRatio: settings.aspectRatio }
        : {}),
    });
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={`Branch from ${parent.id}`}
      className="mx-5 mb-5 rounded-panel border border-border bg-surface p-4 shadow-lifted"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <GitBranch className="size-4 text-accent-text" aria-hidden="true" />
          Branch from {parent.id}
        </h3>
        <SegmentedControl
          label="Branch operation"
          value={operation}
          onChange={setOperation}
          options={OPERATION_OPTIONS}
          className="w-72 max-w-full"
        />
        <p className="min-w-0 flex-1 text-[11px] text-muted max-md:basis-full">
          {OPERATIONS[operation].hint}
        </p>
      </div>

      <label htmlFor={promptId} className="sr-only">
        Prompt for the new version
      </label>
      <textarea
        id={promptId}
        value={draftPrompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={isVary}
        aria-describedby={`${promptId}-diff`}
        maxLength={PROMPT_MAX_LENGTH}
        rows={2}
        className={cn(
          "mt-3 block max-h-40 min-h-16 w-full resize-none rounded-2xl border border-border bg-surface-muted px-3.5 py-2.5 text-[13px] leading-relaxed outline-none scrollbar-thin [field-sizing:content]",
          "transition-[border-color,box-shadow] focus:border-subtle focus:ring-4 focus:ring-accent/15",
          isVary && "text-muted",
        )}
      />

      <div id={`${promptId}-diff`} aria-live="polite" className="mt-2 min-h-5 text-xs">
        {isVary ? (
          <span className="text-muted">Prompt locked — Vary only changes the seed.</span>
        ) : promptChanged ? (
          <div className="flex gap-2">
            <span className="shrink-0 font-medium text-muted">Changes:</span>
            <PromptDiff before={parent.prompt} after={draftPrompt} className="text-xs" />
          </div>
        ) : (
          <span className="text-muted">
            {isRemix
              ? "Pick a new style, model or ratio — or edit the prompt."
              : `Edit the prompt to refine ${parent.id}. Want alternatives instead? Try Vary.`}
          </span>
        )}
      </div>

      {failed.map((job) => (
        <div
          key={job.id}
          role="alert"
          className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-danger/5 px-3 py-2 text-xs text-danger"
        >
          <span className="min-w-0 flex-1">
            {OPERATIONS[job.input.operation].label} failed: {job.error}
          </span>
          <Button variant="secondary" size="sm" icon={RotateCw} onClick={() => retryJob(job)}>
            Retry
          </Button>
          <Button variant="ghost" size="sm" icon={X} onClick={() => dismissJob(job.id)}>
            Dismiss
          </Button>
        </div>
      ))}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isRemix && (
          <>
            <Select
              label="Style"
              prefix="Style:"
              value={settings.style}
              options={STYLES}
              placement="top"
              onChange={update("style")}
            />
            <Select
              label="Model"
              prefix="Model:"
              value={settings.model}
              options={MODELS.image}
              placement="top"
              onChange={update("model")}
            />
            <Select
              label="Aspect ratio"
              value={settings.aspectRatio}
              options={ASPECT_RATIOS}
              placement="top"
              onChange={update("aspectRatio")}
            />
          </>
        )}
        <Select
          label="Number of outputs"
          prefix="#"
          value={settings.count}
          options={OUTPUT_COUNTS.image.map((count) => ({
            value: count,
            label: `${count} image${count > 1 ? "s" : ""}`,
            triggerLabel: String(count),
          }))}
          placement="top"
          onChange={update("count")}
        />

        <div className="ml-auto flex items-center gap-2">
          {running.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Loader2 className="size-3.5 animate-spin text-accent-text" aria-hidden="true" />
              {running.length} generating
              <Button
                variant="ghost"
                size="sm"
                onClick={() => running.forEach((job) => cancelJob(job.id))}
              >
                Cancel
              </Button>
            </span>
          )}
          <Button
            type="submit"
            icon={OPERATIONS[operation].icon}
            disabled={unchanged || !canBranch}
            title={
              !canBranch
                ? `${MAX_CONCURRENT_GENERATIONS} branches are generating — wait for one to finish.`
                : undefined
            }
          >
            {OPERATIONS[operation].label} {parent.id}
          </Button>
        </div>
      </div>
    </form>
  );
}
