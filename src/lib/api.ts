import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function serverError(e: unknown) {
  console.error(e);
  return errorResponse("Serveri viga. Proovi hiljem uuesti.", 500);
}

/** Reads the anonymous learner id from the x-learner-id header. Returns null if missing or invalid. */
export function readLearnerId(req: Request): string | null {
  const id = req.headers.get("x-learner-id");
  return id && UUID_RE.test(id) ? id : null;
}

/** Makes sure the learner row exists (anonymous, no personal data). */
export async function ensureLearner(id: string) {
  await prisma.learner.upsert({ where: { id }, update: {}, create: { id } });
}
