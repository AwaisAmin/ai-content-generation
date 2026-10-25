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
  { value: "1:1", label: "1:1", width: 1, height: 1 },
  { value: "3:4", label: "3:4", width: 3, height: 4 },
  { value: "4:3", label: "4:3", width: 4, height: 3 },
  { value: "9:16", label: "9:16", width: 9, height: 16 },
  { value: "16:9", label: "16:9", width: 16, height: 9 },
];

export const OUTPUT_COUNTS = {
  image: [1, 2, 3, 4],
  video: [1, 2],
};

export const STYLES = [
  { value: "none", label: "None" },
  { value: "cinematic", label: "Cinematic" },
  { value: "editorial", label: "Editorial" },
  { value: "film", label: "Analog film" },
  { value: "3d-render", label: "3D render" },
  { value: "watercolor", label: "Watercolor" },
  { value: "neon", label: "Neon noir" },
];

export const PROMPT_MAX_LENGTH = 1500;

export const DEFAULT_SETTINGS = {
  type: "image",
  model: MODELS.image[0].value,
  aspectRatio: "3:4",
  count: 4,
  style: "none",
};

export function getAspectRatio(value) {
  return ASPECT_RATIOS.find((ratio) => ratio.value === value) ?? ASPECT_RATIOS[0];
}
