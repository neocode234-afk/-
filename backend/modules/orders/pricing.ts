import { SignJWT, jwtVerify } from "jose";
import { type AccountPlanSlug, isAccountPlan } from "@/lib/accounts";

const NAVASAN_ENDPOINT = "https://api.navasan.tech/latest/";
const QUOTE_AUDIENCE = "aliprompt-account-order";
const QUOTE_LIFETIME = "30m";
const PRICE_MULTIPLIER = 10;
type NavasanRate = { value?: string | number; updated_at?: string; date?: string };
type NavasanPayload = Record<string, NavasanRate | undefined>;

export type LivePrice = { plan: AccountPlanSlug; baseAmount: number; amount: number; discountAmount: number; discountPercent: number; dollarToman: number; updatedAt: string | null };
export type PriceQuote = LivePrice & { userId: string };

function signingKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET is not configured securely.");
  return new TextEncoder().encode(secret);
}

function usdPrice(plan: AccountPlanSlug) {
  const key = plan === "chatgpt-plus" ? "CHATGPT_PLUS_USD" : "CLAUDE_PRO_USD";
  const value = Number(process.env[key]);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${key} is not configured.`);
  return value;
}

function readNavasanRate(payload: NavasanPayload) {
  const rate = payload.usd_sell ?? payload.usd;
  const rial = Number(rate?.value);
  if (!Number.isFinite(rial) || rial <= 0) throw new Error("Navasan did not return a valid USD rate.");
  return { toman: Math.round(rial / 10), updatedAt: rate?.updated_at ?? rate?.date ?? null };
}

export async function getDollarTomanRate() {
  const apiKey = process.env.NAVASAN_API_KEY;
  if (!apiKey) throw new Error("NAVASAN_API_KEY is not configured.");
  const response = await fetch(`${NAVASAN_ENDPOINT}?api_key=${encodeURIComponent(apiKey)}`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("Navasan rate request failed.");
  return readNavasanRate((await response.json()) as NavasanPayload);
}

export async function getLivePrice(plan: AccountPlanSlug, firstPurchase: boolean): Promise<LivePrice> {
  const [rate, baseUsd] = await Promise.all([getDollarTomanRate(), Promise.resolve(usdPrice(plan))]);
  const baseAmount = Math.round(rate.toman * baseUsd * PRICE_MULTIPLIER);
  const discountPercent = firstPurchase ? 12 : 0;
  const discountAmount = Math.round((baseAmount * discountPercent) / 100);
  return { plan, baseAmount, amount: baseAmount - discountAmount, discountAmount, discountPercent, dollarToman: rate.toman, updatedAt: rate.updatedAt };
}

export async function createPriceQuote(price: LivePrice, userId: string) {
  return new SignJWT(price).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setAudience(QUOTE_AUDIENCE).setIssuedAt().setExpirationTime(QUOTE_LIFETIME).sign(signingKey());
}

export async function verifyPriceQuote(token: string, userId: string, plan: string): Promise<PriceQuote> {
  const { payload } = await jwtVerify(token, signingKey(), { audience: QUOTE_AUDIENCE, subject: userId });
  const payloadPlan = typeof payload.plan === "string" ? payload.plan : "";
  const amount = typeof payload.amount === "number" ? payload.amount : NaN;
  const baseAmount = typeof payload.baseAmount === "number" ? payload.baseAmount : NaN;
  const discountAmount = typeof payload.discountAmount === "number" ? payload.discountAmount : NaN;
  const discountPercent = typeof payload.discountPercent === "number" ? payload.discountPercent : NaN;
  const dollarToman = typeof payload.dollarToman === "number" ? payload.dollarToman : NaN;
  if (!isAccountPlan(payloadPlan) || payloadPlan !== plan || ![amount, baseAmount, discountAmount, discountPercent, dollarToman].every(Number.isFinite)) throw new Error("Invalid price quote.");
  return { plan: payloadPlan, amount, baseAmount, discountAmount, discountPercent, dollarToman, updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : null, userId };
}
