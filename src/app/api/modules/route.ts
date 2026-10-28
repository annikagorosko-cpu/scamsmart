import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { order: "asc" },
      select: { id: true, order: true, title: true, icon: true, intro: true },
    });
    return NextResponse.json({ modules });
  } catch (e) {
    return serverError(e);
  }
}
