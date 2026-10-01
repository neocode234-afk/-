import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const USER_COOKIE_NAME = "aliprompt_user";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "");

export async function createUserSession(user: { id: number; name: string; phone: string }) {
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is missing");
  return new SignJWT({ role: "user", name: user.name, phone: user.phone }).setProtectedHeader({ alg: "HS256" }).setSubject(String(user.id)).setIssuedAt().setExpirationTime("30d").sign(secret());
}

export async function getUserSession() {
  const token = (await cookies()).get(USER_COOKIE_NAME)?.value;
  if (!token || !process.env.AUTH_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "user" && payload.sub ? payload : null;
  } catch { return null; }
}
