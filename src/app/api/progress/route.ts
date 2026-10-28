import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, readLearnerId, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const learnerId = readLearnerId(req);
    if (!learnerId) return errorResponse("Õppija tunnus puudub.");

    const [modules, completions, attempts] = await Promise.all([
      prisma.module.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
      prisma.moduleCompletion.findMany({ where: { learnerId }, select: { moduleId: true } }),
      prisma.attempt.findMany({
        where: { learnerId },
        orderBy: { createdAt: "asc" },
        select: {
          quizRunId: true,
          isCorrect: true,
          createdAt: true,
          question: { select: { moduleId: true } },
        },
      }),
    ]);

    const runs = new Map<string, { quizRunId: string; date: string; correct: number; total: number }>();
    const byModule = new Map<string, { correct: number; total: number }>();
    for (const a of attempts) {
      const run = runs.get(a.quizRunId) ?? {
        quizRunId: a.quizRunId,
        date: a.createdAt.toISOString(),
        correct: 0,
        total: 0,
      };
      run.total += 1;
      if (a.isCorrect) run.correct += 1;
      runs.set(a.quizRunId, run);

      const m = byModule.get(a.question.moduleId) ?? { correct: 0, total: 0 };
      m.total += 1;
      if (a.isCorrect) m.correct += 1;
      byModule.set(a.question.moduleId, m);
    }

    return NextResponse.json({
      totalModules: modules.length,
      completedModuleIds: completions.map((c) => c.moduleId),
      quizRuns: Array.from(runs.values()).reverse(),
      accuracyByModule: modules.map((m) => ({
        moduleId: m.id,
        title: m.title,
        correct: byModule.get(m.id)?.correct ?? 0,
        total: byModule.get(m.id)?.total ?? 0,
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const learnerId = readLearnerId(req);
    if (!learnerId) return errorResponse("Õppija tunnus puudub.");
    await prisma.$transaction([
      prisma.attempt.deleteMany({ where: { learnerId } }),
      prisma.moduleCompletion.deleteMany({ where: { learnerId } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
