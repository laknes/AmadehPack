import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  const items = await prisma.productImage.findMany({ where: { productId: id }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return forbidden();
  const { id } = await params;
  const parsed = imageSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.productImage.create({ data: { ...parsed.data, productId: id } });
  await logActivity("product_image.create", "Product", id, { imageId: item.id });
  return NextResponse.json(item, { status: 201 });
}
