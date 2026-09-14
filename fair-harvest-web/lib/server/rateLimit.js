// Minimal in-memory sliding-window rate limiter for a single Next.js
// process. Honest limitation: this does NOT coordinate across multiple
// server instances/processes — fine for this app's single-process deployment
// model (see ARCHITECTURE notes), but a real multi-instance production
// deployment would need a shared store (e.g. Redis) instead.
import { ApiError } from "./apiError.js";

const buckets = new Map();

function clientKey(request, scope) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${scope}:${ip}`;
}

export function enforceRateLimit(request, scope, { max = 10, windowMs = 60_000 } = {}) {
  const key = clientKey(request, scope);
  const now = Date.now();
  const bucket = buckets.get(key) || [];
  const recent = bucket.filter((ts) => now - ts < windowMs);

  if (recent.length >= max) {
    throw new ApiError("Too many requests — please try again shortly", 429);
  }

  recent.push(now);
  buckets.set(key, recent);
}
