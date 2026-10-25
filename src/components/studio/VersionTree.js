"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { AlertTriangle, Star } from "lucide-react";
import { useStudio } from "@/components/studio/StudioProvider";
import Skeleton from "@/components/ui/Skeleton";
import { OPERATIONS } from "@/config/studio";
import { cn } from "@/lib/cn";
import { describeChange } from "@/lib/versionSummary";

// Geometry of the connector lines (px). Column c's line sits at
// COLUMN_X + c * INDENT; a node at depth d is centred on column d.
const INDENT = 26;
const COLUMN_X = 26;
const THUMB = 36;
const ROW_MID = 28;

/**
 * The project's lineage as an indented tree with connector lines, like a
 * git graph. Follows the WAI-ARIA tree pattern: roving focus, selection
 * follows focus; ↑/↓ move, ← goes to the parent, → to the first child.
 */
export default function VersionTree({ className, onPick, hideHeading = false }) {
  const { tree, selectedId, compareId, select, compare } = useStudio();
  const itemRefs = useRef(new Map());
  const listRef = useRef(null);
  // Unique per instance: the tree can be mounted twice (inline + drawer).
  const headingId = useId();
  const { rows, byId, children } = tree;
  // Placeholder rows for branches in flight can't be selected.
  const navigable = rows.filter((row) => !row.version.pending);

  // Keep the selected row in view when selection changes from elsewhere.
  useEffect(() => {
    itemRefs.current.get(selectedId)?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  function move(id) {
    if (!id) return;
    select(id);
    itemRefs.current.get(id)?.focus();
  }

  function handleKeyDown(event) {
    const index = navigable.findIndex((row) => row.version.id === selectedId);
    const current = byId.get(selectedId);
    const targets = {
      ArrowDown: navigable[index + 1]?.version.id,
      ArrowUp: navigable[index - 1]?.version.id,
      Home: navigable[0]?.version.id,
      End: navigable.at(-1)?.version.id,
      ArrowLeft: current?.parentId,
      ArrowRight: children.get(selectedId)?.find((child) => !child.pending)?.id,
    };
    if (event.key in targets) {
      event.preventDefault();
      move(targets[event.key]);
    }
  }

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className={cn("flex items-baseline justify-between px-4 pb-2", hideHeading ? "pt-3" : "pt-4")}>
        <h2 id={headingId} className={cn("text-sm font-semibold", hideHeading && "sr-only")}>
          Versions
        </h2>
        <span className="text-[11px] text-muted">{navigable.length} total</span>
      </div>
      <p className="px-4 pb-2 text-[10.5px] text-muted max-lg:hidden">
        ⇧-click to compare · press <kbd className="font-sans font-semibold">?</kbd> for shortcuts
      </p>

      <ul
        ref={listRef}
        role="tree"
        aria-labelledby={headingId}
        onKeyDown={handleKeyDown}
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin"
      >
        {rows.map(({ version, depth, isLast, rails }) => {
          const isSelected = version.id === selectedId;
          const parent = byId.get(version.parentId);
          const hasChildren = children.has(version.id);
          const hero = version.outputs[version.heroIndex] ?? version.outputs[0];
          const { icon: OpIcon, label: opLabel } = OPERATIONS[version.operation];
          const isFailed = version.pending === "failed";
          const summary = version.pending
            ? isFailed
              ? "Failed — retry from the composer"
              : `${opLabel} of ${parent.id} in progress…`
            : describeChange(version, parent);

          return (
            <li
              key={version.id}
              ref={(node) => {
                if (node) itemRefs.current.set(version.id, node);
                else itemRefs.current.delete(version.id);
              }}
              role="treeitem"
              aria-level={depth + 1}
              aria-selected={isSelected}
              aria-disabled={version.pending ? true : undefined}
              tabIndex={isSelected ? 0 : -1}
              onClick={
                version.pending
                  ? undefined
                  : (event) => {
                      if (event.shiftKey) compare(version.id);
                      else move(version.id);
                      onPick?.();
                    }
              }
              className={cn(
                "group relative flex h-14 items-center rounded-2xl pr-2 duration-200",
                "transition-[background-color,box-shadow,opacity,translate] starting:-translate-x-1 starting:opacity-0",
                version.pending ? "cursor-default" : "cursor-pointer",
                isSelected ? "bg-surface shadow-soft" : !version.pending && "hover:bg-surface/60",
              )}
              style={{ paddingLeft: COLUMN_X + depth * INDENT - THUMB / 2 }}
            >
              {/* Connector lines (decorative). */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0">
                {rails.slice(1).map((continues, column) =>
                  continues ? (
                    <span
                      key={column}
                      className="absolute inset-y-0 w-px bg-border"
                      style={{ left: COLUMN_X + column * INDENT }}
                    />
                  ) : null,
                )}
                {depth > 0 && (
                  <>
                    <span
                      className="absolute top-0 w-px bg-border"
                      style={{
                        left: COLUMN_X + (depth - 1) * INDENT,
                        height: isLast ? ROW_MID : "100%",
                      }}
                    />
                    <span
                      className="absolute h-px bg-border"
                      style={{
                        top: ROW_MID,
                        left: COLUMN_X + (depth - 1) * INDENT,
                        width: INDENT - THUMB / 2,
                      }}
                    />
                  </>
                )}
                {hasChildren && (
                  <span
                    className="absolute bottom-0 w-px bg-border"
                    style={{ left: COLUMN_X + depth * INDENT, top: ROW_MID + THUMB / 2 }}
                  />
                )}
              </span>

              <span
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-lg bg-surface-sunken ring-offset-2 ring-offset-surface-muted transition-shadow",
                  isSelected && "ring-2 ring-accent",
                )}
                style={{ width: THUMB, height: THUMB }}
              >
                {version.pending ? (
                  isFailed ? (
                    <AlertTriangle className="absolute inset-0 m-auto size-4 text-danger" aria-hidden="true" />
                  ) : (
                    <Skeleton className="size-full rounded-lg" />
                  )
                ) : (
                  <Image src={hero.src} alt="" fill sizes="36px" quality={60} className="object-cover" />
                )}
              </span>

              <span className="ml-2.5 flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  {version.pending ? (isFailed ? "Not created" : "New version") : version.id}
                  {/* The accessible name comes from this content (no aria-label),
                      so icons carry sr-only text and visible text stays in it. */}
                  <OpIcon className="size-3 text-muted" aria-hidden="true" />
                  <span className="sr-only">, {opLabel}</span>
                  {version.starred && (
                    <>
                      <Star className="size-3 fill-accent text-accent" aria-hidden="true" />
                      <span className="sr-only">, selected</span>
                    </>
                  )}
                  {version.id === compareId && (
                    <span className="rounded-full bg-accent px-1.5 text-[10px] leading-4 font-semibold text-accent-foreground">
                      B<span className="sr-only"> (comparing)</span>
                    </span>
                  )}
                  <span className="sr-only">{": "}</span>
                </span>
                <span className={cn("truncate text-[11px]", isFailed ? "text-danger" : "text-muted")}>
                  {summary}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
