import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [products, orders, users] = await Promise.all([prisma.product.count(), prisma.order.count(), prisma.user.count()]);
  return NextResponse.json({ products, orders, users });
}
