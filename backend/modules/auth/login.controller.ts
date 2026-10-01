import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findAdminByEmail } from "./repository";
import { COOKIE_NAME, createSession } from "@/backend/modules/auth/session";
import { errorResponse, parseJson, AppError } from "@/backend/shared/errors";
import { limitRequest } from "@/backend/shared/rate-limit";
import { logEvent } from "@/backend/shared/logger";

export async function POST(req: Request) {
  try {
    limitRequest(req, "admin-password", 5);
    const { email, password } = await parseJson(req);
    if (typeof email !== "string" || typeof password !== "string" || password.length > 72) throw new AppError(400, "اطلاعات نامعتبر است.");
    const admin = await findAdminByEmail(email.trim().toLowerCase());
    if (!admin || !await bcrypt.compare(password, admin.password_hash)) {
      logEvent("auth.login", { role: "admin", result: "failure" });
      return NextResponse.json({ error: "ایمیل یا رمز عبور نادرست است" }, { status: 401 });
    }
    const token = await createSession({ id: admin.id, email: admin.email });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 8 });
    logEvent("auth.login", { role: "admin", result: "success", adminId: admin.id });
    return response;
  } catch (error) { return errorResponse(error, "admin/login"); }
}
