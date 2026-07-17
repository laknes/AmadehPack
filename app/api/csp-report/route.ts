import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.json().catch(() => undefined);
  return new NextResponse(null, { status: 204 });
}
