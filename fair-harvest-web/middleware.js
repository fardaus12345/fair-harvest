import { NextResponse } from "next/server";

// Explicit, restrictive CORS for the API surface. By default (no
// ALLOWED_ORIGINS set) this app is same-origin only — no wildcard, no
// reflected Origin. Set ALLOWED_ORIGINS to a comma-separated list of exact
// origins if a separate frontend deployment ever needs cross-origin access.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export function middleware(request) {
  const origin = request.headers.get("origin");
  const isAllowed = origin && allowedOrigins.includes(origin);

  if (request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: isAllowed ? 204 : 403 });
    if (isAllowed) applyCorsHeaders(preflight, origin);
    return preflight;
  }

  const response = NextResponse.next();
  if (isAllowed) applyCorsHeaders(response, origin);
  return response;
}

function applyCorsHeaders(response, origin) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Vary", "Origin");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export const config = {
  matcher: "/api/:path*"
};
