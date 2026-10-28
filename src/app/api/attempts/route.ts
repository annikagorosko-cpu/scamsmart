import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureLearner, errorResponse, readLearnerId, serverError } from "@/lib/api";
import { getCoach, pickRandom } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const learnerId = readLearnerId(req);
    if (!learnerId) return errorResponse("Õppija tunnus puudub.");

    const body = (await req.json().catch(() => null)) as {
      questionId?: unknown;
      selectedKey?: unknown;
      quizRunId?: unknown;
    } | null;
    if (
      !body ||
      typeof body.questionId !== "string" ||
      typeof body.selectedKey !== "string" ||
      typeof body.quizRunId !== "string" ||
      body.quizRunId.length < 8 ||
      body.quizRunId.length > 64
    ) {
      return errorResponse("Vigane päring.");
    }

    const question = await prisma.question.findUnique({
      where: { id: body.questionId },
      include: { options: true },
    });
    if (!question) return errorResponse("Küsimust ei leitud.", 404);
    if (!question.options.some((o) => o.key === body.selectedKey)) {
      return errorResponse("Vigane vastusevariant.");
    }

    const isCorrect = body.selectedKey === question.correctOptionKey;
    await ensureLearner(learnerId);
    await prisma.attempt.upsert({
      where: { quizRunId_questionId: { quizRunId: body.quizRunId, questionId: question.id } },
      update: {},
      create: {
        learnerId,
        questionId: question.id,
        selectedKey: body.selectedKey,
        isCorrect,
        quizRunId: body.quizRunId,
      },
    });

    const coach = getCoach();
    return NextResponse.json({
      isCorrect,
      correctOptionKey: question.correctOptionKey,
      explanation: question.explanation,
      coach: pickRandom(isCorrect ? coach.correct : coach.incorrect),
    });
  } catch (e) {
    return serverError(e);
  }
}
