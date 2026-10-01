import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, createSession } from "@/backend/modules/auth/session";
import { USER_COOKIE_NAME, createUserSession } from "@/backend/modules/users/session";
import { findUserByPhone } from "@/backend/modules/users/repository";
import { hasDatabase } from "@/backend/shared/database";
import { errorResponse, parseJson, AppError } from "@/backend/shared/errors";
import { limitRequest } from "@/backend/shared/rate-limit";
import { logEvent } from "@/backend/shared/logger";

export async function POST(req: Request) {
  try {
    limitRequest(req, "account-access", 5);
    const body = await parseJson(req);
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const password = typeof body.code === "string" ? body.code : "";
    if (!/^09\d{9}$/.test(phone) || password.length < 4 || password.length > 72) throw new AppError(400, "شماره یا رمز عبور معتبر نیست.");

    const adminPhone = process.env.ADMIN_PHONE;
    const adminHash = process.env.ADMIN_ACCESS_CODE_HASH;
    if (adminPhone && adminHash && phone === adminPhone && await bcrypt.compare(password, adminHash)) {
      const token = await createSession({ id: 1, email: phone });
      const response = NextResponse.json({ ok: true, admin: true });
      response.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 28800 });
      logEvent("auth.login", { role: "admin", result: "success" });
      return response;
    }

    if (!hasDatabase()) return NextResponse.json({ error: "ورود کاربران پس از تنظیم اتصال MySQL فعال می‌شود." }, { status: 503 });
    const user = await findUserByPhone(phone);
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      logEvent("auth.login", { role: "user", result: "failure" });
      return NextResponse.json({ error: "شماره یا رمز عبور نادرست است." }, { status: 401 });
    }
    const token = await createUserSession(user);
    const response = NextResponse.json({ ok: true, user: { name: user.name } });
    response.cookies.set(USER_COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    logEvent("auth.login", { role: "user", result: "success", userId: user.id });
    return response;
  } catch (error) { return errorResponse(error, "auth/access"); }
}
