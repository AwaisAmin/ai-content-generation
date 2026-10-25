import { delay, errorResponse } from "@/lib/server/http";
import { createVersion, parseVersionInput } from "@/lib/server/studio-db";

/**
 * POST /api/studio/versions
 * Body: { parentId, operation: "vary" | "refine" | "remix", prompt, model,
 *         aspectRatio, style, count }
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "invalid_json", "Request body must be valid JSON.");
  }

  const { data, error } = parseVersionInput(body);
  if (error) return errorResponse(422, "invalid_input", error);

  await delay(1800, 2800);

  if (data.prompt.toLowerCase().includes("#error")) {
    return errorResponse(
      503,
      "model_unavailable",
      "The model is under heavy load right now. Please try again in a moment.",
    );
  }

  return Response.json({ version: createVersion(data) }, { status: 201 });
}
