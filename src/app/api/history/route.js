import { connection } from "next/server";
import { delay } from "@/lib/server/http";
import { listHistory } from "@/lib/server/mock-db";

const HISTORY_LIMIT = 20;

/** GET /api/history — the most recent generations, one cover each. */
export async function GET() {
  // History changes after every generation, so never prerender it.
  await connection();
  await delay(200, 450);
  return Response.json({ items: listHistory({ limit: HISTORY_LIMIT }) });
}
