import { NextResponse } from "next/server";
import { getSession } from "@/backend/modules/auth/session";
import { decryptActivationPassword } from "@/backend/modules/orders/credentials";
import { getOrderActivationCredentials } from "@/backend/modules/orders/repository";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.sub) return NextResponse.json({ error: "دسترسی غیرمجاز است." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "شناسه سفارش معتبر نیست." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  const details = await getOrderActivationCredentials(id);
  if (!details) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  const password = details.ciphertext && details.iv && details.tag ? decryptActivationPassword({ ciphertext: details.ciphertext, iv: details.iv, tag: details.tag }) : null;
  return NextResponse.json({ email: details.email, phone: details.phone, password }, { headers: { "Cache-Control": "no-store" } });
}
