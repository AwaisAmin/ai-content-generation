import { MEDIA_TYPES } from "@/config/generation";
import { delay, errorResponse } from "@/lib/server/http";
import {
  createGeneration,
  listGenerations,
  parseGenerationInput,
} from "@/lib/server/mock-db";

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 24;

// Typing this into a prompt forces a failure, to demo the error UI.
const FAILURE_TRIGGER = "#error";

/** GET /api/generations?type=image|video&cursor=<id>&limit=<n> */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(
    Number(searchParams.get("limit")) || DEFAULT_LIMIT,
    MAX_LIMIT,
  );

  if (type && !MEDIA_TYPES.includes(type)) {
    return errorResponse(400, "invalid_type", `Unknown media type "${type}".`);
  }

  await delay(250, 600);
  return Response.json(listGenerations({ type, cursor, limit }));
}

/** POST /api/generations — body: { type, prompt, model, aspectRatio, count, style } */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "invalid_json", "Request body must be valid JSON.");
  }

  const { data, error } = parseGenerationInput(body);
  if (error) return errorResponse(422, "invalid_input", error);

  // Videos take noticeably longer than images, like real inference.
  await delay(...(data.type === "video" ? [3000, 4500] : [1800, 2800]));

  if (data.prompt.toLowerCase().includes(FAILURE_TRIGGER)) {
    return errorResponse(
      503,
      "model_unavailable",
      "The model is under heavy load right now. Please try again in a moment.",
    );
  }

  return Response.json({ item: createGeneration(data) }, { status: 201 });
}
