import "server-only";

import images from "@/data/images.json";
import videos from "@/data/videos.json";
import seedGenerations from "@/data/seed-generations.json";
import {
  MEDIA_TYPES,
  MODELS,
  OUTPUT_COUNTS,
  PROMPT_MAX_LENGTH,
  STYLES,
  getAspectRatio,
  getAspectRatios,
} from "@/config/generation";

/*
 * In-memory "database" for the mock API. It lives for the lifetime of the
 * server process, so new generations persist across requests locally but
 * reset on a serverless cold start — good enough to exercise a real
 * fetch / loading / error flow on the frontend.
 */

const IMAGE_LONG_SIDE = 1200;
const mediaById = new Map(
  [...images, ...videos].map((media) => [media.id, media]),
);

function imageDimensions(aspectRatio) {
  const { width, height } = getAspectRatio(aspectRatio);
  const scale = IMAGE_LONG_SIDE / Math.max(width, height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function unsplashUrl(photoId, { width, height }) {
  const params = new URLSearchParams({
    w: String(width),
    h: String(height),
    fit: "crop",
    crop: "faces,entropy",
    q: "80",
  });
  return `https://images.unsplash.com/photo-${photoId}?${params}`;
}

/** Shapes one media item as an output of `generation` (an image or video). */
export function toOutput(generation, media, index) {
  const id = `${generation.id}-${index + 1}`;

  if (generation.type === "video") {
    return {
      id,
      type: "video",
      src: media.src,
      alt: media.alt,
      width: media.width,
      height: media.height,
      duration: media.duration,
      credit: media.credit,
    };
  }

  const size = imageDimensions(generation.aspectRatio);
  return {
    id,
    type: "image",
    src: unsplashUrl(media.photoId, size),
    alt: media.alt,
    ...size,
  };
}

function hydrate(record) {
  const outputs = record.mediaIds.map((mediaId, index) =>
    toOutput(record, mediaById.get(mediaId), index),
  );
  const { mediaIds, ...generation } = record;
  return { ...generation, status: "completed", outputs };
}

export function getMedia(id) {
  return mediaById.get(id);
}

const generations = seedGenerations.map(hydrate);
let nextId = generations.length + 1;

/**
 * Pick the media whose tags best match the prompt, so "a cat on a sofa"
 * returns cats. Ties are shuffled so repeated prompts feel fresh.
 * `exclude` skips media ids (e.g. a parent version's results).
 */
export function pickMedia(type, prompt, count, { exclude = [] } = {}) {
  const pool = (type === "video" ? videos : images).filter(
    (media) => !exclude.includes(media.id),
  );
  const words = new Set(prompt.toLowerCase().match(/[a-z0-9]+/g) ?? []);

  return pool
    .map((media) => ({
      media,
      score: media.tags.filter((tag) => words.has(tag)).length + Math.random(),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ media }) => media.id);
}

export function listGenerations({ type, cursor, limit }) {
  const filtered = type
    ? generations.filter((generation) => generation.type === type)
    : generations;

  const start = cursor
    ? filtered.findIndex((generation) => generation.id === cursor) + 1
    : 0;
  const items = filtered.slice(start, start + limit);
  const hasMore = start + limit < filtered.length;

  return {
    items,
    nextCursor: hasMore ? items.at(-1).id : null,
  };
}

export function listHistory({ limit }) {
  return generations.slice(0, limit).map((generation) => ({
    id: generation.id,
    type: generation.type,
    prompt: generation.prompt,
    createdAt: generation.createdAt,
    cover: generation.outputs[0],
  }));
}

export function createGeneration({ type, prompt, model, aspectRatio, count, style }) {
  const id = `gen-${String(nextId++).padStart(3, "0")}`;
  const generation = hydrate({
    id,
    type,
    prompt,
    model,
    aspectRatio,
    style,
    createdAt: new Date().toISOString(),
    mediaIds: pickMedia(type, prompt, count),
  });

  generations.unshift(generation);
  return generation;
}

/**
 * Validates and normalises a create-generation payload.
 * Returns `{ data }` on success or `{ error }` with a user-facing message.
 */
export function parseGenerationInput(body) {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const type = body.type ?? "image";
  if (!MEDIA_TYPES.includes(type)) {
    return { error: `Unknown media type "${type}".` };
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return { error: "Describe what you'd like to create." };
  }
  if (prompt.length > PROMPT_MAX_LENGTH) {
    return { error: `Prompts are limited to ${PROMPT_MAX_LENGTH} characters.` };
  }

  const model = body.model ?? MODELS[type][0].value;
  if (!MODELS[type].some((option) => option.value === model)) {
    return { error: `Model "${model}" doesn't support ${type} generation.` };
  }

  const aspectRatio = body.aspectRatio ?? getAspectRatios(type)[0].value;
  if (!getAspectRatios(type).some((ratio) => ratio.value === aspectRatio)) {
    return { error: `Aspect ratio "${aspectRatio}" isn't available for ${type}s.` };
  }

  const count = Number(body.count ?? OUTPUT_COUNTS[type].at(-1));
  if (!OUTPUT_COUNTS[type].includes(count)) {
    const max = OUTPUT_COUNTS[type].at(-1);
    return { error: `You can generate up to ${max} ${type}s at a time.` };
  }

  const style = body.style ?? "none";
  if (!STYLES.some((option) => option.value === style)) {
    return { error: `Unknown style "${style}".` };
  }

  return { data: { type, prompt, model, aspectRatio, count, style } };
}
