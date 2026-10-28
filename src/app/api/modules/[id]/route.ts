import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const mod = await prisma.module.findUnique({ where: { id } });
    if (!mod) return errorResponse("Moodulit ei leitud.", 404);
    return NextResponse.json({ module: mod });
  } catch (e) {
    return serverError(e);
  }
}
