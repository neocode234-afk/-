import { NextResponse } from "next/server";
import { getUserSession } from "@/backend/modules/users/session";
import { hasDatabase } from "@/backend/shared/database";
import { createAccountOrder, hasAccountOrderForUser } from "./repository";
import { readReceipt } from "./service";
import { accountOffers, isAccountPlan } from "@/lib/accounts";
import { verifyPriceQuote } from "./pricing";
import { encryptActivationPassword } from "./credentials";
import { AppError, errorResponse } from "@/backend/shared/errors";
import { limitRequest } from "@/backend/shared/rate-limit";
import { logEvent } from "@/backend/shared/logger";

function textField(form: FormData, key: string) { return typeof form.get(key) === "string" ? String(form.get(key)).trim() : ""; }

export async function POST(request: Request) {
  try {
    limitRequest(request, "account-order", 3, 60_000);
    const session = await getUserSession();
    if (!session?.sub) return NextResponse.json({ error: "برای ثبت سفارش ابتدا وارد حساب کاربری شوید." }, { status: 401 });
    if (!hasDatabase()) return NextResponse.json({ error: "ثبت سفارش پس از تنظیم MySQL فعال می‌شود." }, { status: 503 });

    const form = await request.formData();
    const plan = textField(form, "plan");
    const quote = textField(form, "quote");
    const activationEmail = textField(form, "activationEmail").toLowerCase();
    const activationPassword = typeof form.get("activationPassword") === "string" ? String(form.get("activationPassword")) : "";
    const contactPhone = textField(form, "contactPhone");
    const reference = textField(form, "reference");
    const receipt = form.get("receipt");
    const offer = accountOffers.find((item) => item.slug === plan);

    if (!offer || !isAccountPlan(plan)) throw new AppError(400, "سرویس انتخاب‌شده معتبر نیست.");
    if (!quote) throw new AppError(400, "مبلغ سفارش منقضی شده است؛ صفحه را تازه‌سازی کنید.");
    const price = await verifyPriceQuote(quote, session.sub, plan);
    if (price.discountPercent === 12 && await hasAccountOrderForUser(session.sub)) throw new AppError(409, "تخفیف خرید اول قبلاً استفاده شده است؛ صفحه را تازه‌سازی کنید.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activationEmail) || activationEmail.length > 190) throw new AppError(400, "ایمیل فعال‌سازی معتبر نیست.");
    if (activationPassword.length < 8 || activationPassword.length > 128) throw new AppError(400, "رمز عبور موقت باید بین ۸ تا ۱۲۸ کاراکتر باشد.");
    if (!/^09\d{9}$/.test(contactPhone)) throw new AppError(400, "شماره پاسخ‌گو باید با ۰۹ شروع شود.");
    if (reference.length < 4 || reference.length > 100) throw new AppError(400, "شماره پیگیری پرداخت را وارد کنید.");
    if (!(receipt instanceof File)) throw new AppError(400, "تصویر یا PDF رسید را انتخاب کنید.");

    const saved = await readReceipt(receipt);
    const password = encryptActivationPassword(activationPassword);
    const id = await createAccountOrder({ userId: session.sub, planSlug: offer.slug, planTitle: offer.title, amount: price.amount, activationEmail, contactPhone, passwordCiphertext: password.ciphertext, passwordIv: password.iv, passwordTag: password.tag, reference, receiptName: saved.originalName, receiptType: saved.type, receipt: saved.data });
    logEvent("order.created", { orderId: id, userId: session.sub, plan: offer.slug });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) { return errorResponse(error, "orders"); }
}
