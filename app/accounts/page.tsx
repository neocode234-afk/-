import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgePercent, CheckCircle2, CircleDollarSign, ShieldCheck } from "lucide-react";
import { OrderForm } from "@/components/OrderForm";
import { accountOffers, formatToman, getAccountOffer, isAccountPlan, type AccountPlanSlug } from "@/lib/accounts";
import { getUserSession } from "@/backend/modules/users/session";
import { hasAccountOrderForUser } from "@/backend/modules/orders/repository";
import { createPriceQuote, getLivePrice, type LivePrice } from "@/backend/modules/orders/pricing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "خرید اکانت", description: "خرید امن اشتراک‌های حرفه‌ای با قیمت‌گذاری به‌روز در AliPrompt." };
type PlanWithPrice = { slug: AccountPlanSlug; title: string; description: string; features: string[]; price: LivePrice };

export default async function AccountsPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const offer = getAccountOffer(plan);
  const user = await getUserSession();
  const hasPreviousOrder = user?.sub ? await hasAccountOrderForUser(user.sub) : false;
  const plans = await Promise.all(accountOffers.filter((item): item is typeof item & { slug: AccountPlanSlug } => isAccountPlan(item.slug)).map(async (item) => ({ ...item, price: await getLivePrice(item.slug, false) }))).catch(() => [] as PlanWithPrice[]);
  const selected = isAccountPlan(offer.slug) ? plans.find((item) => item.slug === offer.slug) : undefined;
  const discountedPrice = selected && user?.sub && !hasPreviousOrder ? await getLivePrice(selected.slug, true).catch(() => null) : null;
  const quote = selected && user?.sub ? await createPriceQuote(selected.price, user.sub) : null;
  const discountQuote = discountedPrice && user?.sub ? await createPriceQuote(discountedPrice, user.sub) : null;
  const paymentCard = process.env.PAYMENT_CARD_NUMBER;
  const paymentHolder = process.env.PAYMENT_CARD_HOLDER;

  return <main className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6 sm:pt-12 lg:px-8">
    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-black/65 transition hover:text-violet dark:text-white/65"><ArrowRight aria-hidden="true" size={16} />بازگشت به خانه</Link>
    <section className="surface rounded-[2rem] p-5 sm:p-8"><span className="eyebrow">Account purchase</span><div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-black tracking-tight sm:text-5xl">خرید اکانت حرفه‌ای</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-black/65 sm:text-base dark:text-white/65">سرویس مناسب را انتخاب کنید و مبلغ به‌روز را پیش از پرداخت ببینید.</p></div><div className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-violet/10 px-4 py-3 text-sm font-bold text-violet"><BadgePercent aria-hidden="true" size={19} />تخفیف خرید اول</div></div></section>
    {plans.length === 0 ? <section className="mt-6 rounded-[1.75rem] border border-amber-400/40 bg-amber-50 p-5 text-sm leading-7 text-amber-900 dark:bg-amber-950/20 dark:text-amber-100">دریافت قیمت لحظه‌ای فعلاً ممکن نیست. اتصال Navasan یا تنظیمات قیمت را بررسی کنید.</section> : <section className="mt-6 grid gap-4 md:grid-cols-2">{plans.map((item) => <Link key={item.slug} href={`/accounts?plan=${item.slug}`} className={`group rounded-[1.75rem] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${selected?.slug === item.slug ? "border-violet bg-violet/5 shadow-lg shadow-violet/10" : "border-black/10 bg-white/65 dark:border-white/10 dark:bg-white/5"}`}><div className="flex items-start justify-between gap-3"><div><h2 className="text-2xl font-black">{item.title}</h2><p className="mt-2 text-sm leading-6 text-black/65 dark:text-white/65">{item.description}</p></div><CircleDollarSign aria-hidden="true" className="shrink-0 text-violet" size={28} /></div><div className="mt-5 rounded-2xl bg-black/[.045] p-4 dark:bg-white/[.07]"><p className="text-xs font-bold text-black/55 dark:text-white/55">مبلغ امروز</p><p className="mt-1 text-3xl font-black text-violet">{formatToman(item.price.amount)} <span className="text-sm">تومان</span></p><p className="mt-2 text-xs text-black/55 dark:text-white/55">تخفیف خرید اول در مرحلهٔ پرداخت قابل اعمال است.</p></div><div className="mt-4 grid gap-2 text-sm">{item.features.map((feature) => <p key={feature} className="flex items-center gap-2"><CheckCircle2 aria-hidden="true" size={16} className="text-violet" />{feature}</p>)}</div></Link>)}</section>}
    {selected && <section className="mt-7 grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-start"><aside className="surface rounded-[1.75rem] p-5 sm:p-6"><h2 className="text-2xl font-black">{selected.title}</h2><p className="mt-3 text-sm leading-7 text-black/65 dark:text-white/65">قیمت تا ۳۰ دقیقه برای ثبت همین سفارش معتبر است.</p><div className="mt-5 rounded-2xl bg-violet p-5 text-white"><span className="text-xs text-white/70">مبلغ پیش از تخفیف</span><p className="mt-2 text-3xl font-black">{formatToman(selected.price.amount)} <span className="text-base">تومان</span></p></div><div className="mt-4 flex gap-2 text-xs leading-6 text-black/60 dark:text-white/60"><ShieldCheck aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-violet" />فعال‌سازی فقط پس از بررسی رسید و تأیید مدیر انجام می‌شود.</div></aside><div>{user && quote ? <OrderForm plan={selected.slug} title={selected.title} quote={quote} discountQuote={discountQuote} amount={selected.price.amount} discountedAmount={discountedPrice?.amount} cardNumber={paymentCard} cardHolder={paymentHolder} /> : <section className="surface rounded-[1.75rem] p-6 text-center"><h2 className="text-xl font-black">برای ثبت سفارش وارد شوید</h2><p className="mt-2 text-sm leading-7 text-black/65 dark:text-white/65">نمایش کارت و ارسال رسید فقط برای کاربران واردشده فعال است.</p><Link href="/login" className="button-accent mt-5">ورود یا ساخت حساب</Link></section>}</div></section>}
  </main>;
}
