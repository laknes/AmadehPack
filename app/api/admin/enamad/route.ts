import { NextResponse } from "next/server";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { enamadSchema } from "@/lib/validators";

const key = "enamad";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return NextResponse.json(setting?.value ?? { enabled: false });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return forbidden();
  const parsed = enamadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const setting = await prisma.siteSetting.upsert({
    where: { key },
    update: { value: parsed.data, group: "trust" },
    create: { key, value: parsed.data, group: "trust" },
  });
  await logActivity("enamad.update", "SiteSetting", key);
  return NextResponse.json(setting.value);
}
