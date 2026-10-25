"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import MobileComposerBar from "@/components/prompt/MobileComposerBar";
import PromptForm, { PLACEHOLDERS } from "@/components/prompt/PromptForm";
import IconButton from "@/components/ui/IconButton";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { usePromptSettings } from "@/hooks/usePromptSettings";
import { cn } from "@/lib/cn";

const isDesktopNow = () => window.matchMedia(DESKTOP_QUERY).matches;

/**
 * Owns the prompt settings and renders them in the layout that fits:
 * - md+: the form sits in the sidebar.
 * - mobile: a compact bar above the tab bar, expanding into a bottom sheet.
 * It's one form instance either way, so nothing is lost on resize.
 */
export default function PromptComposer({
  initialSettings,
  autoFocus = false,
  onGenerate,
  runningCount,
  canGenerate,
}) {
  const { settings, update, setType } = usePromptSettings(initialSettings);
  const [error, setError] = useState(null);
  // A reused prompt on mobile opens straight into the sheet. (The
  // initializer only reads `window` on remount, never during hydration.)
  const [sheetOpen, setSheetOpen] = useState(() => autoFocus && !isDesktopNow());
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isSheetOpen = sheetOpen && !isDesktop;

  const sheetRef = useRef(null);
  const promptRef = useRef(null);

  useFocusTrap(sheetRef, isSheetOpen, {
    initialFocusRef: promptRef,
    onEscape: () => setSheetOpen(false),
  });

  // Desktop: focus the reused prompt with the caret at the end.
  useEffect(() => {
    if (!autoFocus || !isDesktopNow()) return;
    const textarea = promptRef.current;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [autoFocus]);

  function handlePromptChange(value) {
    update("prompt", value);
    if (error) setError(null);
  }

  function submit() {
    if (!canGenerate) return;

    if (!settings.prompt.trim()) {
      setError("Describe what you'd like to create first.");
      if (isDesktopNow()) promptRef.current?.focus();
      else setSheetOpen(true);
      return;
    }
    // The prompt is kept after submitting: iterating on it is the norm.
    onGenerate({ ...settings, prompt: settings.prompt.trim() });
    setSheetOpen(false);
  }

  return (
    <>
      <MobileComposerBar
        prompt={settings.prompt}
        placeholder={PLACEHOLDERS[settings.type]}
        runningCount={runningCount}
        canGenerate={canGenerate}
        expanded={isSheetOpen}
        onOpen={() => setSheetOpen(true)}
        onGenerate={submit}
      />

      {isSheetOpen && (
        <div
          aria-hidden="true"
          onClick={() => setSheetOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 starting:opacity-0 md:hidden"
        />
      )}

      <div
        ref={sheetRef}
        role={isSheetOpen ? "dialog" : undefined}
        aria-modal={isSheetOpen || undefined}
        aria-label={isSheetOpen ? "Create" : undefined}
        data-scroll-lock={isSheetOpen}
        className={cn(
          "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-50 max-md:max-h-[88dvh] max-md:overflow-y-auto max-md:overscroll-contain",
          "max-md:rounded-t-panel max-md:bg-surface-muted max-md:pb-[env(safe-area-inset-bottom)] max-md:shadow-lifted max-md:scrollbar-thin",
          "max-md:duration-300 max-md:ease-out-soft",
          // Opening: visibility flips instantly (only translate animates), so
          // the focus trap can focus the prompt in the same frame. Closing:
          // visibility waits for the slide-out to finish.
          isSheetOpen
            ? "max-md:translate-y-0 max-md:transition-[translate]"
            : "max-md:invisible max-md:translate-y-full max-md:transition-[translate,visibility]",
        )}
      >
        <div className="flex items-center justify-between px-4 pt-3 md:hidden">
          <span aria-hidden="true" className="mx-auto h-1 w-10 rounded-full bg-subtle/50" />
          <IconButton
            icon={X}
            label="Close"
            size="sm"
            onClick={() => setSheetOpen(false)}
            className="absolute top-2 right-3"
          />
        </div>

        <PromptForm
          settings={settings}
          update={update}
          setType={setType}
          error={error}
          onPromptChange={handlePromptChange}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          promptRef={promptRef}
          runningCount={runningCount}
          canGenerate={canGenerate}
        />
      </div>
    </>
  );
}
