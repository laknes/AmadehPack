import { NextResponse } from "next/server";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  const items = await prisma.product.findMany({
    include: { category: true, brand: true, images: true, inventory: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.product.create({ data: parsed.data });
  await logActivity("product.create", "Product", item.id);
  return NextResponse.json(item, { status: 201 });
}
