import { NextResponse } from "next/server";
import { contactTicketSchema } from "@/lib/validators";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "تعداد درخواست‌ها بیش از حد مجاز است. چند دقیقه دیگر دوباره تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    const parsed = contactTicketSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "اطلاعات فرم صحیح نیست." }, { status: 400 });
    }

    const ticket = await prisma.contactTicket.create({ data: parsed.data });
    return NextResponse.json({ id: ticket.id, message: "درخواست شما با موفقیت ثبت شد." }, { status: 201 });
  } catch (error) {
    console.error("Contact ticket creation failed", error);
    return NextResponse.json({ error: "ثبت درخواست انجام نشد. دوباره تلاش کنید." }, { status: 500 });
  }
}