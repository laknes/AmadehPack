import { NextResponse } from "next/server";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { bannerSchema } from "@/lib/validators";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  return NextResponse.json({ items: await prisma.banner.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }] }) });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = bannerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.banner.create({ data: parsed.data });
  await logActivity("banner.create", "Banner", item.id);
  return NextResponse.json(item, { status: 201 });
}
