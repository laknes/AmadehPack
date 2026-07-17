import { NextResponse } from "next/server";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/validators";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  return NextResponse.json({ items: await prisma.coupon.findMany({ orderBy: { code: "asc" } }) });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = couponSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.coupon.create({ data: parsed.data });
  await logActivity("coupon.create", "Coupon", item.id);
  return NextResponse.json(item, { status: 201 });
}
