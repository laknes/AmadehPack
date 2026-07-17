import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ items: [], note: "Cart is persisted client-side with Zustand and can be synced here." });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true, cart: await request.json() });
}
