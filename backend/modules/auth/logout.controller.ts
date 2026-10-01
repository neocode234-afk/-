import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/backend/modules/auth/session";
import { USER_COOKIE_NAME } from "@/backend/modules/users/session";
import { logEvent } from "@/backend/shared/logger";
export async function POST() { const res = NextResponse.json({ ok: true }); res.cookies.set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" }); res.cookies.set(USER_COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" }); logEvent("auth.logout"); return res; }
