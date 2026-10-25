"use client";

import PromptComposer from "@/components/prompt/PromptComposer";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

/**
 * Connects the prompt composer to the workspace. Reusing a past generation
 * changes the `key`, remounting the composer pre-filled with its settings.
 */
export default function PromptPanel({ defaultType }) {
  const { draft, generate, runningCount, canGenerate } = useWorkspace();

  return (
    <PromptComposer
      key={draft?.nonce ?? "initial"}
      initialSettings={draft?.settings ?? { type: defaultType }}
      autoFocus={Boolean(draft)}
      onGenerate={generate}
      runningCount={runningCount}
      canGenerate={canGenerate}
    />
  );
}
