import "server-only";

import project from "@/data/studio-project.json";
import {
  ASPECT_RATIOS,
  MODELS,
  OUTPUT_COUNTS,
  PROMPT_MAX_LENGTH,
  SEED_MAX,
  STYLES,
} from "@/config/generation";
import { getMedia, pickMedia, toOutput } from "@/lib/server/mock-db";

/*
 * In-memory store for the Studio's branching project. Each version records
 * its parent and the operation that produced it, forming a tree. Like the
 * main mock store it lives for the server process only.
 */

export const OPERATIONS = ["vary", "refine", "remix"];

function hydrate(record) {
  const { mediaIds, ...version } = record;
  const owner = { id: record.id, type: "image", aspectRatio: record.aspectRatio };
  return {
    ...version,
    outputs: mediaIds.map((mediaId, index) => toOutput(owner, getMedia(mediaId), index)),
  };
}

// Raw records keep media ids (used to avoid repeats on "vary").
const records = project.versions.map((version) => ({ ...version }));
let nextNumber = records.length + 1;

export function getProject() {
  const { versions, ...meta } = project;
  return { ...meta, versions: records.map(hydrate) };
}

function findRecord(id) {
  return records.find((record) => record.id === id);
}

/**
 * Creates a child of `parentId`:
 * - vary:   same prompt and settings, new seed, fresh results.
 * - refine: edited prompt, same seed, so only the words change the image.
 * - remix:  new style / model / ratio (and optionally prompt), new seed.
 */
export function createVersion({ parentId, operation, prompt, model, aspectRatio, style, count }) {
  const parent = findRecord(parentId);
  const isVary = operation === "vary";
  const nextPrompt = isVary ? parent.prompt : prompt;
  const styleWords = STYLES.find((option) => option.value === style)?.label ?? "";

  const record = {
    id: `v${nextNumber++}`,
    parentId,
    operation,
    prompt: nextPrompt,
    model: isVary ? parent.model : model,
    aspectRatio: isVary ? parent.aspectRatio : aspectRatio,
    style: isVary ? parent.style : style,
    seed: operation === "refine" ? parent.seed : Math.floor(Math.random() * SEED_MAX),
    createdAt: new Date().toISOString(),
    mediaIds: pickMedia("image", `${nextPrompt} ${styleWords}`, count, {
      exclude: isVary ? parent.mediaIds : [],
    }),
    heroIndex: 0,
    starred: false,
    note: "",
  };

  records.push(record);
  return hydrate(record);
}

export function updateVersion(id, changes) {
  const record = findRecord(id);
  if (!record) return null;
  Object.assign(record, changes);
  return hydrate(record);
}

/** Validates a create-version payload. Returns `{ data }` or `{ error }`. */
export function parseVersionInput(body) {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const parent = findRecord(body.parentId);
  if (!parent) return { error: "Choose a version to branch from." };

  if (!OPERATIONS.includes(body.operation)) {
    return { error: `Unknown operation "${body.operation}".` };
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : parent.prompt;
  if (!prompt) return { error: "Describe what you'd like to create." };
  if (prompt.length > PROMPT_MAX_LENGTH) {
    return { error: `Prompts are limited to ${PROMPT_MAX_LENGTH} characters.` };
  }

  const model = body.model ?? parent.model;
  if (!MODELS.image.some((option) => option.value === model)) {
    return { error: `Unknown model "${model}".` };
  }

  const aspectRatio = body.aspectRatio ?? parent.aspectRatio;
  if (!ASPECT_RATIOS.some((ratio) => ratio.value === aspectRatio)) {
    return { error: `Unsupported aspect ratio "${aspectRatio}".` };
  }

  const style = body.style ?? parent.style;
  if (!STYLES.some((option) => option.value === style)) {
    return { error: `Unknown style "${style}".` };
  }

  const count = Number(body.count ?? 4);
  if (!OUTPUT_COUNTS.image.includes(count)) {
    return { error: "You can generate up to 4 images at a time." };
  }

  return {
    data: { parentId: parent.id, operation: body.operation, prompt, model, aspectRatio, style, count },
  };
}

/** Validates a version update. Only `starred`, `heroIndex` and `note` change. */
export function parseVersionUpdate(id, body) {
  const record = findRecord(id);
  if (!record) return { notFound: true };
  if (!body || typeof body !== "object") return { error: "Request body must be a JSON object." };

  const changes = {};
  if ("starred" in body) changes.starred = Boolean(body.starred);
  if ("heroIndex" in body) {
    const index = Number(body.heroIndex);
    if (!Number.isInteger(index) || index < 0 || index >= record.mediaIds.length) {
      return { error: "That output doesn't exist on this version." };
    }
    changes.heroIndex = index;
  }
  if ("note" in body) changes.note = String(body.note).slice(0, 280);

  return { data: changes };
}
