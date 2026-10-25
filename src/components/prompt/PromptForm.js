"use client";

import { Image as ImageIcon, Video } from "lucide-react";
import AdvancedSettings from "@/components/prompt/AdvancedSettings";
import GenerationOptions from "@/components/prompt/GenerationOptions";
import PromptInput from "@/components/prompt/PromptInput";
import StylePicker from "@/components/prompt/StylePicker";
import Accordion from "@/components/ui/Accordion";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { STYLES } from "@/config/generation";

const TYPE_OPTIONS = [
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
];

export const PLACEHOLDERS = {
  image: "Describe your imagination and turn it into a piece of art…",
  video: "Describe a scene, the motion and the camera move…",
};

/** The creation form's fields. State and submit logic live in PromptComposer. */
export default function PromptForm({
  settings,
  update,
  setType,
  error,
  onPromptChange,
  onSubmit,
  promptRef,
  runningCount,
  canGenerate,
}) {
  const styleLabel = STYLES.find((style) => style.value === settings.style)?.label;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-label="Create"
      className="flex flex-col gap-4 rounded-panel bg-surface-muted p-4"
    >
      <SegmentedControl
        label="What to create"
        value={settings.type}
        onChange={setType}
        options={TYPE_OPTIONS}
      />

      <PromptInput
        ref={promptRef}
        value={settings.prompt}
        onChange={onPromptChange}
        placeholder={PLACEHOLDERS[settings.type]}
        error={error}
        runningCount={runningCount}
        canGenerate={canGenerate}
      />

      <GenerationOptions settings={settings} update={update} />

      <div className="space-y-3 pt-1">
        <Accordion title="Advance">
          <AdvancedSettings settings={settings} update={update} />
        </Accordion>
        <Accordion
          title="Styles"
          meta={settings.style !== "none" ? styleLabel : undefined}
        >
          <StylePicker value={settings.style} onChange={(value) => update("style", value)} />
        </Accordion>
      </div>
    </form>
  );
}
