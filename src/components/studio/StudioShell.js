"use client";

import { CloudOff, RotateCw } from "lucide-react";
import StudioTopBar from "@/components/studio/StudioTopBar";
import { useStudio } from "@/components/studio/StudioProvider";
import VersionInspector from "@/components/studio/VersionInspector";
import VersionStage from "@/components/studio/VersionStage";
import VersionTree from "@/components/studio/VersionTree";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

/**
 * Full-height studio: the page never scrolls, each panel scrolls on its
 * own — versions on the left, the stage in the middle, details on the right.
 */
export default function StudioShell() {
  const { status, error, retry, selected, announcement } = useStudio();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <StudioTopBar />

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

      {status === "success" && selected && (
        <main
          id="main"
          className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)_320px]"
        >
          <VersionTree className="border-r border-border bg-surface-muted/60 max-lg:hidden" />
          <VersionStage />
          <VersionInspector className="border-l border-border bg-surface-muted/60 max-lg:hidden" />
        </main>
      )}
    </div>
  );
}
