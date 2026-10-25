import "server-only";

/** Simulates network / inference latency, within [min, max] ms. */
export function delay(min, max = min) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Consistent error envelope: `{ error: { code, message } }`. */
export function errorResponse(status, code, message) {
  return Response.json({ error: { code, message } }, { status });
}
