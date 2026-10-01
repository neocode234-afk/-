import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { schema } from "./schema";
import { hasDatabase } from "@/backend/shared/database";
import { createUser } from "./repository";
import { USER_COOKIE_NAME, createUserSession } from "./session";
import { errorResponse, parseJson } from "@/backend/shared/errors";
import { limitRequest } from "@/backend/shared/rate-limit";
import { logEvent } from "@/backend/shared/logger";

export async function POST(req: Request) {
  try {
    limitRequest(req, "register", 4, 60 * 60_000);
    if (!hasDatabase()) return NextResponse.json({ error: "ثبت‌نام پس از تنظیم اتصال MySQL فعال می‌شود." }, { status: 503 });
    const parsed = schema.safeParse(await parseJson(req));
    if (!parsed.success) return NextResponse.json({ error: "نام فارسی، شماره معتبر و رمز ۸ تا ۷۲ کاراکتری وارد کنید." }, { status: 400 });

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const id = await createUser(parsed.data.name, parsed.data.phone, passwordHash);
    const token = await createUserSession({ id, name: parsed.data.name, phone: parsed.data.phone });
    const response = NextResponse.json({ ok: true, user: { name: parsed.data.name } }, { status: 201 });
    response.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    logEvent("auth.register", { result: "success", userId: id });
    return response;
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      logEvent("auth.register", { result: "duplicate" });
      return NextResponse.json({ error: "این شماره قبلاً ثبت شده است." }, { status: 409 });
    }
    return errorResponse(error, "auth/register");
  }
}
