import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureLearner, errorResponse, readLearnerId, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const learnerId = readLearnerId(req);
    if (!learnerId) return errorResponse("Õppija tunnus puudub.");

    const mod = await prisma.module.findUnique({ where: { id }, select: { id: true } });
    if (!mod) return errorResponse("Moodulit ei leitud.", 404);

    await ensureLearner(learnerId);
    await prisma.moduleCompletion.upsert({
      where: { learnerId_moduleId: { learnerId, moduleId: id } },
      update: {},
      create: { learnerId, moduleId: id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
