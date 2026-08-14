import { NextResponse } from "next/server";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { contactTicketStatusSchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  const parsed = contactTicketStatusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "وضعیت تیکت معتبر نیست." }, { status: 400 });

  const item = await prisma.contactTicket.update({ where: { id }, data: parsed.data });
  await logActivity("contact-ticket.status", "ContactTicket", id, { status: parsed.data.status });
  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  await prisma.contactTicket.delete({ where: { id } });
  await logActivity("contact-ticket.delete", "ContactTicket", id);
  return NextResponse.json({ ok: true });
}