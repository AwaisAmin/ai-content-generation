"use client";

import PromptForm from "@/components/prompt/PromptForm";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

/**
 * Connects the prompt form to the workspace. Reusing a past generation
 * changes the `key`, remounting the form pre-filled with its settings.
 */
export default function PromptPanel({ defaultType }) {
  const { draft, generate, runningCount, canGenerate } = useWorkspace();

  return (
    <PromptForm
      key={draft?.nonce ?? "initial"}
      initialSettings={draft?.settings ?? { type: defaultType }}
      autoFocus={Boolean(draft)}
      onGenerate={generate}
      runningCount={runningCount}
      canGenerate={canGenerate}
    />
  );
}
