import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  const items = await prisma.activityLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ items });
}
