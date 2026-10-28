import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCoach, shuffle } from "@/lib/content";
import { serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Returns all questions in random order. Correct answers are NOT included. */
export async function GET() {
  try {
    const rows = await prisma.question.findMany({
      include: { options: { orderBy: { key: "asc" } } },
    });
    const questions = shuffle(rows).map((q) => ({
      id: q.id,
      moduleId: q.moduleId,
      prompt: q.prompt,
      options: shuffle(q.options).map((o) => ({ key: o.key, text: o.text })),
    }));
    return NextResponse.json({
      quizRunId: crypto.randomUUID(),
      questions,
      resultBands: getCoach().resultBands,
    });
  } catch (e) {
    return serverError(e);
  }
}
