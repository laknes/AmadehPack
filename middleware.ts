import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const authSecret = process.env.NEXTAUTH_SECRET ?? "amadeh-pack-local-development-secret-change-in-production";
const isProduction = process.env.NODE_ENV === "production";
const isProductionRuntime = isProduction && process.env.NEXT_PHASE !== "phase-production-build";

function hasProductionSecret() {
  return !isProductionRuntime || Boolean(process.env.NEXTAUTH_SECRET);
}

function missingSecretResponse(request: NextRequest) {
  return jsonError("Server authentication is not configured.", 503, request);
}

function securityHeaders(request: NextRequest) {
  const siteOrigin = new URL(request.url).origin;
  const connectSrc = isProduction ? "'self' https:" : "'self' https: http://localhost:* ws://localhost:*";
  const upgrade = isProduction ? "upgrade-insecure-requests" : "";

  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http://localhost:*",
      "font-src 'self' data:",
      `connect-src ${connectSrc}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      `report-uri ${siteOrigin}/api/csp-report`,
      upgrade,
    ].filter(Boolean).join("; "),
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-DNS-Prefetch-Control": "off",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Origin-Agent-Cluster": "?1",
    ...(isProduction ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" } : {}),
  };
}

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  const headers = securityHeaders(request);
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
}

function jsonError(message: string, status: number, request: NextRequest) {
  return applySecurityHeaders(NextResponse.json({ error: message }, { status }), request);
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function isMutatingMethod(method: string) {
  return !["GET", "HEAD", "OPTIONS"].includes(method);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = pathname.startsWith("/api/admin") || pathname.startsWith("/admin") || pathname.startsWith("/account");

  if (!requiresAuth) {
    return applySecurityHeaders(NextResponse.next(), request);
  }

  if (!hasProductionSecret()) return missingSecretResponse(request);

  const token = await getToken({ req: request, secret: authSecret });

  if (pathname.startsWith("/api/admin")) {
    if (!token) return jsonError("Unauthorized", 401, request);
    if (token.role !== "admin") return jsonError("Forbidden", 403, request);
    if (isMutatingMethod(request.method) && !sameOrigin(request)) return jsonError("Invalid request origin", 403, request);
  }

  if (pathname.startsWith("/admin") && token?.role !== "admin") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl), request);
  }

  if (pathname.startsWith("/account") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl), request);
  }

  return applySecurityHeaders(NextResponse.next(), request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|mock-products|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$).*)",
  ],
};
