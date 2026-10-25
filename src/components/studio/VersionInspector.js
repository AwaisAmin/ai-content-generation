"use client";

import { useId, useState } from "react";
import { ChevronRight } from "lucide-react";
import CopyButton from "@/components/feed/CopyButton";
import OperationBadge from "@/components/studio/OperationBadge";
import PromptDiff from "@/components/studio/PromptDiff";
import { useStudio } from "@/components/studio/StudioProvider";
import { MODELS, STYLES } from "@/config/generation";
import { cn } from "@/lib/cn";
import { getLineage } from "@/lib/versionTree";

const sectionTitle = "mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase";

/** Everything about the selected version: prompt and its diff, settings, lineage, notes. */
export default function VersionInspector({ className }) {
  const { selected: version, tree, select, patchVersion } = useStudio();
  const [showChanges, setShowChanges] = useState(true);
  const noteId = useId();

  const parent = tree.byId.get(version.parentId);
  const lineage = getLineage(tree.byId, version.id);
  const branches = tree.children.get(version.id) ?? [];
  const settings = [
    { key: "model", label: "Model", display: MODELS.image.find((m) => m.value === version.model)?.label },
    { key: "aspectRatio", label: "Ratio" },
    { key: "style", label: "Style", display: STYLES.find((s) => s.value === version.style)?.label },
    { key: "seed", label: "Seed" },
  ];

  function saveNote(event) {
    const note = event.target.value.trim();
    if (note !== version.note) patchVersion(version.id, { note });
  }

  return (
    <aside aria-label="Version details" className={cn("overflow-y-auto scrollbar-thin", className)}>
      <div className="space-y-6 p-5">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className={cn(sectionTitle, "mb-0")}>Prompt</h3>
            <div className="flex items-center gap-1">
              {parent && (
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted">
                  <input
                    type="checkbox"
                    checked={showChanges}
                    onChange={(event) => setShowChanges(event.target.checked)}
                    className="accent-accent"
                  />
                  Changes vs {parent.id}
                </label>
              )}
              <CopyButton text={version.prompt} />
            </div>
          </div>
          {parent && showChanges ? (
            <PromptDiff before={parent.prompt} after={version.prompt} />
          ) : (
            <p className="text-[13px] leading-relaxed">{version.prompt}</p>
          )}
        </section>

        <section>
          <h3 className={sectionTitle}>Settings</h3>
          <dl className="grid grid-cols-2 gap-2">
            {settings.map(({ key, label, display }) => {
              const changed = parent && parent[key] !== version[key];
              return (
                <div key={key} className="rounded-xl bg-surface px-3 py-2 shadow-soft">
                  <dt className="text-[10.5px] text-muted">{label}</dt>
                  <dd className={cn("text-xs font-medium tabular-nums", changed && "text-accent-text")}>
                    {display ?? version[key]}
                    {changed && <span className="sr-only"> (changed)</span>}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section>
          <h3 className={sectionTitle}>Lineage</h3>
          <ol className="flex flex-wrap items-center gap-1 text-xs">
            {lineage.map((ancestor, index) => (
              <li key={ancestor.id} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="size-3 text-muted" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => select(ancestor.id)}
                  aria-current={ancestor.id === version.id ? "true" : undefined}
                  className={cn(
                    "rounded-full px-2 py-0.5 transition-colors",
                    ancestor.id === version.id
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface text-foreground hover:bg-surface-sunken",
                  )}
                >
                  {ancestor.id}
                </button>
              </li>
            ))}
          </ol>
          {branches.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              Branches:
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => select(branch.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-foreground transition-colors hover:bg-surface-sunken"
                >
                  {branch.id}
                  <OperationBadge operation={branch.operation} className="bg-transparent px-0 py-0" />
                </button>
              ))}
            </p>
          )}
        </section>

        <section>
          <label htmlFor={noteId} className={cn(sectionTitle, "block")}>
            Note
          </label>
          <textarea
            // Remount per version so the draft never leaks between versions.
            key={version.id}
            id={noteId}
            defaultValue={version.note}
            onBlur={saveNote}
            rows={3}
            maxLength={280}
            placeholder="Why this version? Feedback, next steps…"
            className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-xs leading-relaxed outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-subtle focus:ring-4 focus:ring-accent/15"
          />
          <p className="mt-1 text-[10.5px] text-muted">Saved when you click away.</p>
        </section>
      </div>
    </aside>
  );
}
