import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export const errorResponse = (error: unknown) => {
  if (error instanceof AppError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("Unhandled API error", error);
  return NextResponse.json({ error: "خطای داخلی سرور رخ داد. دوباره تلاش کنید." }, { status: 500 });
};

export async function parseJson(request: Request) {
  try { return await request.json(); }
  catch { throw new AppError(400, "بدنه درخواست معتبر نیست."); }
}
