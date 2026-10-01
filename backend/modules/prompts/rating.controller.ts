import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserSession } from "@/backend/modules/users/session";
import { AppError, errorResponse, parseJson } from "@/backend/shared/errors";
import { ratePrompt } from "./repository";

const ratingSchema = z.object({ rating: z.number().int().min(1).max(5) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getUserSession();
    if (!session?.sub) return NextResponse.json({ error: "برای ثبت امتیاز ابتدا وارد حساب خود شوید." }, { status: 401 });
    const { id } = await params;
    if (!/^\d+$/.test(id)) throw new AppError(400, "شناسهٔ پرامپت معتبر نیست.");
    const parsed = ratingSchema.safeParse(await parseJson(request));
    if (!parsed.success) throw new AppError(400, "امتیاز باید بین ۱ تا ۵ باشد.");
    const result = await ratePrompt(id, Number(session.sub), parsed.data.rating);
    if (!result) throw new AppError(404, "پرامپت موردنظر پیدا نشد.");
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "prompts/rating");
  }
}
