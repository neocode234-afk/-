import { NextResponse } from "next/server";
import { logError } from "./logger";

export class AppError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export const errorResponse = (error: unknown, route = "api") => {
  if (error instanceof AppError) return NextResponse.json({ error: error.message }, { status: error.status });
  const requestId = logError("api.error", error, { route });
  return NextResponse.json({ error: "خطای داخلی سرور رخ داد. دوباره تلاش کنید.", requestId }, { status: 500, headers: { "X-Request-Id": requestId } });
};

export async function parseJson(request: Request) {
  try { return await request.json(); }
  catch { throw new AppError(400, "بدنه درخواست معتبر نیست."); }
}
