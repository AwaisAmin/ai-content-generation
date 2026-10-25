"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";

/** Catches unexpected render errors so the header and nav stay usable. */
export default function WorkspaceError({ error, retry }) {
  useEffect(() => {
    // Hook point for an error reporting service.
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 py-24 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-3xl bg-surface-sunken text-danger">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm leading-relaxed text-muted">
          The workspace hit an unexpected error. Your generations are saved — try again to
          reload this view.
        </p>
      </div>
      <Button icon={RotateCw} onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
