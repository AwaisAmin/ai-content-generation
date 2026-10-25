import { errorResponse } from "@/lib/server/http";
import { parseVersionUpdate, updateVersion } from "@/lib/server/studio-db";

/** PATCH /api/studio/versions/:id — body: { starred?, heroIndex?, note? } */
export async function PATCH(request, { params }) {
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "invalid_json", "Request body must be valid JSON.");
  }

  const { data, error, notFound } = parseVersionUpdate(id, body);
  if (notFound) return errorResponse(404, "not_found", `Version "${id}" doesn't exist.`);
  if (error) return errorResponse(422, "invalid_input", error);

  return Response.json({ version: updateVersion(id, data) });
}
