import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().min(2).optional(), description: z.string().optional().nullable() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.role.update({ where: { id }, data: parsed.data });
  await logActivity("role.update", "Role", id);
  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  await prisma.role.delete({ where: { id } });
  await logActivity("role.delete", "Role", id);
  return NextResponse.json({ ok: true });
}
