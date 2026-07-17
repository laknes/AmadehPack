import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({ roles: z.array(z.string().min(1)).min(1) });

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await prisma.userRole.deleteMany({ where: { userId: id } });
  const roles = await Promise.all(parsed.data.roles.map((name) => prisma.role.upsert({ where: { name }, update: {}, create: { name } })));
  await prisma.userRole.createMany({ data: roles.map((role) => ({ userId: id, roleId: role.id })), skipDuplicates: true });
  await logActivity("user.roles.update", "User", id, { roles: parsed.data.roles });
  return NextResponse.json({ ok: true });
}
