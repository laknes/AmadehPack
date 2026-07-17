import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { siteSettingsSchema } from "@/lib/validators";

const key = "site";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  return NextResponse.json(await getSiteSettings());
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = siteSettingsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const current = await getSiteSettings();
  const value = {
    ...current,
    ...parsed.data,
    appearance: { ...current.appearance, ...parsed.data.appearance },
    shipping: parsed.data.shipping ?? current.shipping,
    payment: { ...current.payment, ...parsed.data.payment },
  };
  const setting = await prisma.siteSetting.upsert({
    where: { key },
    update: { value: value as unknown as Prisma.InputJsonValue, group: "general" },
    create: { key, value: value as unknown as Prisma.InputJsonValue, group: "general" },
  });
  await logActivity("settings.update", "SiteSetting", key);
  return NextResponse.json(setting.value);
}
