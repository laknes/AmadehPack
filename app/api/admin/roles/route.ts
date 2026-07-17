import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().min(2), description: z.string().optional().nullable() });

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  return NextResponse.json({ items: await prisma.role.findMany({ include: { users: true }, orderBy: { name: "asc" } }) });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.role.create({ data: parsed.data });
  await logActivity("role.create", "Role", item.id);
  return NextResponse.json(item, { status: 201 });
}
