"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import AdvancedSettings from "@/components/prompt/AdvancedSettings";
import GenerationOptions from "@/components/prompt/GenerationOptions";
import PromptInput from "@/components/prompt/PromptInput";
import StylePicker from "@/components/prompt/StylePicker";
import Accordion from "@/components/ui/Accordion";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { STYLES } from "@/config/generation";
import { usePromptSettings } from "@/hooks/usePromptSettings";

const TYPE_OPTIONS = [
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
];

const PLACEHOLDERS = {
  image: "Describe your imagination and turn it into a piece of art…",
  video: "Describe a scene, the motion and the camera move…",
};

/**
 * Left-hand creation panel. Owns its form state; hands a validated
 * settings object to `onGenerate` (wired to the API in the next step).
 */
export default function PromptPanel({ defaultType, onGenerate, isGenerating = false }) {
  const { settings, update, setType } = usePromptSettings(defaultType);
  const [error, setError] = useState(null);
  const promptRef = useRef(null);
  const styleLabel = STYLES.find((style) => style.value === settings.style)?.label;

  function handlePromptChange(value) {
    update("prompt", value);
    if (error) setError(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isGenerating) return;

    if (!settings.prompt.trim()) {
      setError("Describe what you'd like to create first.");
      promptRef.current?.focus();
      return;
    }
    onGenerate?.({ ...settings, prompt: settings.prompt.trim() });
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
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
        onChange={handlePromptChange}
        placeholder={PLACEHOLDERS[settings.type]}
        error={error}
        isGenerating={isGenerating}
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
