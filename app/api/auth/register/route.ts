import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "درخواست‌های ثبت‌نام بیش از حد مجاز است. چند دقیقه دیگر دوباره تلاش کنید." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "این ایمیل قبلا ثبت شده است." }, { status: 409 });

  const userRole = await prisma.role.upsert({ where: { name: "user" }, update: {}, create: { name: "user" } });
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      roles: { create: [{ roleId: userRole.id }] },
    },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
