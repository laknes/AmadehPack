import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { active: true },
      select: { id: true, provider: true, title: true, sandbox: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ items: gateways.length ? gateways : [{ provider: "MOCK", title: "پرداخت آزمایشی", sandbox: true }] });
  } catch {
    return NextResponse.json({ items: [{ provider: "MOCK", title: "پرداخت آزمایشی", sandbox: true }] });
  }
}
