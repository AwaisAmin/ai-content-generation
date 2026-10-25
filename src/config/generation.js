/**
 * Generation options shared by the UI and the mock API, so client controls
 * and server validation can never drift apart.
 */

export const MEDIA_TYPES = ["image", "video"];

export const MODELS = {
  image: [
    { value: "fomi-realism", label: "Realism", description: "Photographic detail" },
    { value: "fomi-artistic", label: "Artistic", description: "Painterly & stylised" },
    { value: "fomi-anime", label: "Anime", description: "Illustration & cel shading" },
  ],
  video: [
    { value: "fomi-motion", label: "Motion", description: "Fast, 5s clips" },
    { value: "fomi-cinema", label: "Cinema", description: "Film-grade, 10s clips" },
  ],
};

export const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1", description: "Square", width: 1, height: 1 },
  { value: "3:4", label: "3:4", description: "Portrait", width: 3, height: 4 },
  { value: "4:3", label: "4:3", description: "Landscape", width: 4, height: 3 },
  { value: "9:16", label: "9:16", description: "Story", width: 9, height: 16 },
  { value: "16:9", label: "16:9", description: "Widescreen", width: 16, height: 9 },
];

// Video models render in a fixed 16:9 frame for now.
const ASPECT_RATIOS_BY_TYPE = {
  image: ASPECT_RATIOS.map((ratio) => ratio.value),
  video: ["16:9"],
};

export const OUTPUT_COUNTS = {
  image: [1, 2, 3, 4],
  video: [1, 2],
};

const stylePreview = (photoId) =>
  `https://images.unsplash.com/photo-${photoId}?w=240&h=240&fit=crop&crop=faces,entropy`;

export const STYLES = [
  { value: "none", label: "None", preview: null },
  { value: "cinematic", label: "Cinematic", preview: stylePreview("1503023345310-bd7c1de61c7d") },
  { value: "editorial", label: "Editorial", preview: stylePreview("1524504388940-b1c1722653e1") },
  { value: "film", label: "Analog film", preview: stylePreview("1502602898657-3e91760cbb34") },
  { value: "3d-render", label: "3D render", preview: stylePreview("1618005182384-a83a8bd57fbe") },
  { value: "watercolor", label: "Watercolor", preview: stylePreview("1579546929518-9e396f3cc809") },
  { value: "neon", label: "Neon noir", preview: stylePreview("1534528741775-53994a69daeb") },
];

export const GUIDANCE_RANGE = { min: 1, max: 20, step: 0.5, default: 7 };
export const SEED_MAX = 2 ** 32 - 1;

export const PROMPT_MAX_LENGTH = 1500;

/** Typical time to first result, used to pace the progress bar. */
export const ESTIMATED_DURATION_MS = { image: 2300, video: 3750 };

/** How many generations can run at once before Generate waits. */
export const MAX_CONCURRENT_GENERATIONS = 3;

export const DEFAULT_SETTINGS = {
  type: "image",
  prompt: "",
  model: MODELS.image[0].value,
  aspectRatio: "3:4",
  count: 4,
  style: "none",
  negativePrompt: "",
  guidance: GUIDANCE_RANGE.default,
  seed: "",
};

export function getAspectRatio(value) {
  return ASPECT_RATIOS.find((ratio) => ratio.value === value) ?? ASPECT_RATIOS[0];
}

export function getAspectRatios(type) {
  return ASPECT_RATIOS.filter((ratio) =>
    ASPECT_RATIOS_BY_TYPE[type].includes(ratio.value),
  );
}

/**
 * Settings that stay valid when switching between image and video: keeps
 * everything the new type supports and falls back to its defaults otherwise.
 */
export function adaptSettingsToType(settings, type) {
  const models = MODELS[type];
  const ratios = ASPECT_RATIOS_BY_TYPE[type];
  const counts = OUTPUT_COUNTS[type];

  return {
    ...settings,
    type,
    model: models.some((m) => m.value === settings.model) ? settings.model : models[0].value,
    aspectRatio: ratios.includes(settings.aspectRatio) ? settings.aspectRatio : ratios[0],
    count: Math.min(settings.count, counts.at(-1)),
  };
}
