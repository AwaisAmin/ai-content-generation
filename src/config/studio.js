import { PenLine, Shuffle, Sparkles, Sprout } from "lucide-react";

/**
 * The ways a version can be created. `hint` explains what stays fixed —
 * shown in the composer so the effect of each operation is predictable.
 */
export const OPERATIONS = {
  origin: {
    label: "Origin",
    icon: Sprout,
    hint: "The first version of this direction.",
  },
  vary: {
    label: "Vary",
    icon: Shuffle,
    shortcut: "V",
    hint: "Same prompt and settings, new seed — explore alternatives.",
  },
  refine: {
    label: "Refine",
    icon: PenLine,
    shortcut: "R",
    hint: "Edit the prompt, keep the seed — only your words change the image.",
  },
  remix: {
    label: "Remix",
    icon: Sparkles,
    shortcut: "X",
    hint: "Change style, model or framing with a new seed.",
  },
};

export const BRANCH_OPERATIONS = ["vary", "refine", "remix"];
