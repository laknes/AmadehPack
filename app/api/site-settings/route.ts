import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({
    appearance: settings.appearance,
    shipping: settings.shipping,
    payment: settings.payment,
  });
}
