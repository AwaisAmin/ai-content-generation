"use client";

import { useState } from "react";
import { CloudOff, RotateCw } from "lucide-react";
import BranchComposer from "@/components/studio/BranchComposer";
import ShortcutList from "@/components/studio/ShortcutList";
import StudioTopBar from "@/components/studio/StudioTopBar";
import { useStudio } from "@/components/studio/StudioProvider";
import VersionInspector from "@/components/studio/VersionInspector";
import VersionStage from "@/components/studio/VersionStage";
import VersionTree from "@/components/studio/VersionTree";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import Skeleton from "@/components/ui/Skeleton";
import { useHotkeys } from "@/hooks/useHotkeys";
import { defaultComparePartner, neighbourVersion } from "@/lib/versionTree";

/**
 * Full-height studio. Desktop: versions | stage | details, each panel
 * scrolling on its own. Below lg, versions and details open as drawers
 * and the stage scrolls.
 */
export default function StudioShell() {
  const { status, error, retry, tree, selected, compared, select, compare, patchVersion, announcement } =
    useStudio();
  // "versions" | "details" | "shortcuts" | null
  const [panel, setPanel] = useState(null);
  const ready = status === "success" && Boolean(selected);

  useHotkeys(
    {
      j: () => select(neighbourVersion(tree, selected.id, 1) ?? selected.id),
      k: () => select(neighbourVersion(tree, selected.id, -1) ?? selected.id),
      s: () => patchVersion(selected.id, { starred: !selected.starred }),
      c: () => compare(compared ? null : defaultComparePartner(tree, selected)),
      "?": () => setPanel("shortcuts"),
    },
    { enabled: ready },
  );

  const closePanel = () => setPanel(null);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <StudioTopBar onOpenPanel={setPanel} />

      <p className="sr-only" role="status">
        {announcement}
      </p>

      {status === "loading" && (
        <div aria-busy="true" className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <p className="sr-only" role="status">Loading project…</p>
          <Skeleton className="hidden lg:block" />
          <Skeleton className="rounded-[1.5rem]" />
          <Skeleton className="hidden lg:block" />
        </div>
      )}

      {status === "error" && (
        <div role="alert" className="m-auto flex max-w-sm flex-col items-center gap-4 p-6 text-center">
          <CloudOff className="size-6 text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">{error}</p>
          <Button variant="secondary" icon={RotateCw} onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {ready && (
        <>
          <main
            id="main"
            className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)_320px]"
          >
            <VersionTree className="border-r border-border bg-surface-muted/60 max-lg:hidden" />
            <VersionStage>
              {/* Keyed by version: the draft restarts from the new parent. */}
              <BranchComposer key={selected.id} parent={selected} />
            </VersionStage>
            <VersionInspector className="border-l border-border bg-surface-muted/60 max-lg:hidden" />
          </main>

          <Drawer open={panel === "versions"} onClose={closePanel} side="left" title="Versions">
            <VersionTree className="flex-1" onPick={closePanel} hideHeading />
          </Drawer>
          <Drawer open={panel === "details"} onClose={closePanel} side="right" title={`${selected.id} details`}>
            <VersionInspector />
          </Drawer>
        </>
      )}

      <Drawer open={panel === "shortcuts"} onClose={closePanel} side="center" title="Keyboard shortcuts">
        <ShortcutList />
      </Drawer>
    </div>
  );
}
