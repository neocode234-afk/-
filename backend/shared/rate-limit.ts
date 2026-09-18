import { AppError } from "./errors";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function limitRequest(request: Request, scope: string, max = 8, windowMs = 15 * 60_000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
  bucket.count += 1;
  buckets.set(key, bucket);
  if (bucket.count > max) throw new AppError(429, "تعداد تلاش‌ها زیاد است؛ چند دقیقه دیگر دوباره تلاش کنید.");
}
