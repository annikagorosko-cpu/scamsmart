import { readFileSync } from "node:fs";
import path from "node:path";

type Band = { min: number; max: number; text: string };
type Coach = { correct: string[]; incorrect: string[]; resultBands: Band[] };

let cache: Coach | null = null;

/** Coach messages live in the content file (not in the database). */
export function getCoach(): Coach {
  if (!cache) {
    const file = path.join(process.cwd(), "content", "scamsmart-content.json");
    const data = JSON.parse(readFileSync(file, "utf-8")) as { coachMessages: Coach };
    cache = data.coachMessages;
  }
  return cache;
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
