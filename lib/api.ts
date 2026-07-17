import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return null;
  return session;
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function logActivity(action: string, entity: string, entityId?: string, metadata?: Record<string, unknown>) {
  const session = await getServerSession(authOptions);
  await prisma.activityLog.create({
    data: {
      action,
      entity,
      entityId,
      userId: session?.user?.id,
      metadata: (metadata ?? {}) as Prisma.InputJsonValue,
    },
  }).catch(() => undefined);
}
