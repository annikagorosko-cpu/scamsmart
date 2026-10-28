"use client";

const KEY = "scamsmart-learner-id";

/** Anonymous learner id stored in the browser. No name, email or login. */
export function getLearnerId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Storage blocked: fall back to a per-page-load id.
    return crypto.randomUUID();
  }
}

export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-learner-id": getLearnerId(),
      ...(init.headers ?? {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Midagi läks valesti.");
  return data as T;
}
