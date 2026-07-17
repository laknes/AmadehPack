import { NextResponse } from "next/server";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  return NextResponse.json({ items: await prisma.category.findMany({ include: { parent: true }, orderBy: { createdAt: "desc" } }) });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.category.create({ data: parsed.data });
  await logActivity("category.create", "Category", item.id);
  return NextResponse.json(item, { status: 201 });
}
