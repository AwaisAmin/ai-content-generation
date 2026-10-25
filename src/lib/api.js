/**
 * Thin client for the mock API. Components never call `fetch` directly, so
 * swapping in the real backend only touches this file.
 */

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request(path, { signal, ...init } = {}) {
  let response;
  try {
    response = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      signal,
      ...init,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("You appear to be offline. Check your connection.", {
      code: "network_error",
    });
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? "Something went wrong. Please try again.",
      { status: response.status, code: payload?.error?.code },
    );
  }
  return payload;
}

export function fetchGenerations({ type, cursor, limit, signal } = {}) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const query = params.size ? `?${params}` : "";
  return request(`/api/generations${query}`, { signal });
}

export async function createGeneration(input, { signal } = {}) {
  const { item } = await request("/api/generations", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
  return item;
}

export async function fetchHistory({ signal } = {}) {
  const { items } = await request("/api/history", { signal });
  return items;
}

export async function fetchStudioProject({ signal } = {}) {
  const { project } = await request("/api/studio", { signal });
  return project;
}

/** Branches a new version from `parentId` via "vary" | "refine" | "remix". */
export async function createStudioVersion(input, { signal } = {}) {
  const { version } = await request("/api/studio/versions", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
  return version;
}

export async function updateStudioVersion(id, changes) {
  const { version } = await request(`/api/studio/versions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
  return version;
}
