import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { products } from "@/lib/data";
import { productSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({ where: { id }, include: { images: true, variants: true, inventory: true, reviews: true } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    const product = products.find((item) => item.id === id || item.slug === id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...product,
      images: [{ id: `${product.id}-image`, url: product.image, alt: product.name, sortOrder: 0, productId: product.id }],
      variants: [],
      inventory: { quantity: 0, reserved: 0, lowStock: 0 },
      reviews: [],
    });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = productSchema.partial().safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
