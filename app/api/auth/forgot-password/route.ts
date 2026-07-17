import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validators";

const genericMessage = "اگر حسابی با این ایمیل وجود داشته باشد، راهنمای بازیابی رمز عبور ارسال می‌شود.";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { message: "درخواست‌ها بیش از حد مجاز است. چند دقیقه دیگر دوباره تلاش کنید." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const parsed = forgotPasswordSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "ایمیل وارد شده معتبر نیست." }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true },
  }).catch(() => null);

  if (user) {
    await prisma.activityLog.create({
      data: {
        action: "auth.password_reset.request",
        entity: "User",
        entityId: user.id,
        metadata: { email: user.email },
      },
    }).catch(() => undefined);
  }

  return NextResponse.json({ message: genericMessage });
}
