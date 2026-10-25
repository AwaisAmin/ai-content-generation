import { connection } from "next/server";
import { delay } from "@/lib/server/http";
import { getProject } from "@/lib/server/studio-db";

/** GET /api/studio — the project with its full version tree. */
export async function GET() {
  // The tree changes as versions are added, so never prerender it.
  await connection();
  await delay(250, 500);
  return Response.json({ project: getProject() });
}
