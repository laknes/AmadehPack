import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { categories, products } from "@/lib/data";
import { authOptions } from "@/lib/auth";
import { paginationSchema, productSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = paginationSchema.parse(Object.fromEntries(searchParams));
  const where = {
    isActive: true,
    ...(parsed.q ? { OR: [{ name: { contains: parsed.q, mode: "insensitive" as const } }, { sku: { contains: parsed.q, mode: "insensitive" as const } }] } : {}),
    ...(parsed.category ? { category: { slug: parsed.category } } : {}),
  };
  try {
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { images: true, category: true, inventory: true },
        orderBy: parsed.sort === "featured" ? { isFeatured: "desc" } : parsed.sort === "name" ? { name: "asc" } : { createdAt: "desc" },
        skip: (parsed.page - 1) * parsed.limit,
        take: parsed.limit,
      }),
      prisma.product.count({ where }),
    ]);
    return NextResponse.json({ items, total, page: parsed.page, limit: parsed.limit });
  } catch {
    const filtered = products
      .filter((product) => (parsed.category ? product.category === parsed.category : true))
      .filter((product) => (parsed.q ? product.name.includes(parsed.q) || product.sku.toLowerCase().includes(parsed.q.toLowerCase()) : true))
      .sort((a, b) => {
        if (parsed.sort === "featured") return Number(b.featured) - Number(a.featured);
        if (parsed.sort === "name") return a.name.localeCompare(b.name, "fa");
        return 0;
      })
      .map((product) => ({
        ...product,
        price: product.price,
        isFeatured: product.featured,
        isActive: true,
        images: [{ id: `${product.id}-image`, url: product.image, alt: product.name, sortOrder: 0, productId: product.id }],
        category: categories.find((category) => category.slug === product.category) ?? null,
        inventory: { quantity: 0, reserved: 0, lowStock: 0 },
      }));
    const start = (parsed.page - 1) * parsed.limit;
    return NextResponse.json({ items: filtered.slice(start, start + parsed.limit), total: filtered.length, page: parsed.page, limit: parsed.limit });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}
