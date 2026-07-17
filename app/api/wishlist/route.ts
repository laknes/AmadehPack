import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ items: [] });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true, item: await request.json() });
}
