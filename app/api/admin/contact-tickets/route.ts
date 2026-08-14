import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  const items = await prisma.contactTicket.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}