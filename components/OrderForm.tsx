"use client";

import { CheckCircle2, LoaderCircle, LockKeyhole, Tag, Upload } from "lucide-react";
import { useState } from "react";
import { PaymentCard } from "@/components/PaymentCard";
import { formatToman } from "@/lib/accounts";

type Props = { plan: string; title: string; quote: string; discountQuote?: string | null; amount: number; discountedAmount?: number; cardNumber?: string; cardHolder?: string };

export function OrderForm({ plan, title, quote, discountQuote, amount, discountedAmount, cardNumber, cardHolder }: Props) {
  const [activationEmail, setActivationEmail] = useState("");
  const [activationPassword, setActivationPassword] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const finalAmount = applyDiscount && discountedAmount ? discountedAmount : amount;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!receipt) { setMessage("رسید پرداخت را انتخاب کنید."); return; }
    setBusy(true); setMessage("");
    try {
      const data = new FormData();
      data.set("plan", plan); data.set("quote", applyDiscount && discountQuote ? discountQuote : quote); data.set("activationEmail", activationEmail); data.set("activationPassword", activationPassword); data.set("contactPhone", contactPhone); data.set("reference", reference); data.set("receipt", receipt);
      const response = await fetch("/api/orders", { method: "POST", body: data });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "ثبت درخواست انجام نشد.");
      setDone(true); setMessage(`درخواست شماره ${body.id} برای بررسی ثبت شد.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "اتصال برقرار نشد؛ دوباره تلاش کنید."); } finally { setBusy(false); }
  }

  if (done) return <section className="surface rounded-[1.75rem] p-6 text-center"><CheckCircle2 aria-hidden="true" size={40} className="mx-auto text-green-600" /><h2 className="mt-3 text-xl font-black">رسید ثبت شد</h2><p role="status" className="mt-2 text-sm leading-7 text-black/65 dark:text-white/65">{message} فعال‌سازی پس از بررسی مدیر انجام می‌شود.</p></section>;

  return <form onSubmit={submit} className="surface rounded-[1.75rem] p-5 sm:p-7"><h2 className="text-xl font-black">ثبت سفارش {title}</h2><p className="mt-2 text-sm leading-7 text-black/65 dark:text-white/65">اطلاعات فعال‌سازی را وارد کنید، سپس پرداخت کارت‌به‌کارت را انجام دهید.</p>
    <section className="mt-5"><div className="mb-3 flex items-center gap-2 text-sm font-black"><LockKeyhole aria-hidden="true" size={18} className="text-violet" />مرحلهٔ ۱: اطلاعات فعال‌سازی</div><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold sm:col-span-2">ایمیل موردنظر برای فعال‌سازی<input required type="email" autoComplete="email" value={activationEmail} onChange={(event) => setActivationEmail(event.target.value)} className="input" dir="ltr" placeholder="name@example.com" /></label><label className="grid gap-2 text-xs font-bold">رمز عبور<input required type="password" autoComplete="new-password" minLength={8} maxLength={128} value={activationPassword} onChange={(event) => setActivationPassword(event.target.value)} className="input" dir="ltr" placeholder="حداقل ۸ کاراکتر" /></label><label className="grid gap-2 text-xs font-bold">شماره پاسخ‌گو<input required type="tel" inputMode="numeric" autoComplete="tel" pattern="09[0-9]{9}" maxLength={11} value={contactPhone} onChange={(event) => setContactPhone(event.target.value.replace(/\D/g, "").slice(0, 11))} className="input" dir="ltr" placeholder="09xxxxxxxxx" /></label></div><p className="mt-3 text-xs leading-6 text-black/55 dark:text-white/55">رمز عبور فقط به‌صورت رمزنگاری‌شده برای انجام فعال‌سازی نگهداری می‌شود.</p></section>
    {discountQuote && discountedAmount ? <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-violet/25 bg-violet/[.05] p-4"><input type="checkbox" checked={applyDiscount} onChange={(event) => setApplyDiscount(event.target.checked)} className="mt-1 size-4 accent-violet" /><span><span className="flex items-center gap-2 font-black"><Tag aria-hidden="true" size={17} className="text-violet" />اعمال تخفیف ۱۲٪ خرید اول</span><span className="mt-1 block text-xs leading-6 text-black/65 dark:text-white/65">مبلغ پس از تخفیف: {formatToman(discountedAmount)} تومان</span></span></label> : null}
    <div className="mt-5 rounded-2xl bg-black/[.045] px-4 py-3 text-sm font-bold dark:bg-white/[.07]">مبلغ قابل پرداخت: <span className="text-violet">{formatToman(finalAmount)} تومان</span></div>
    <div className="my-6 border-t border-black/10 dark:border-white/10" /><PaymentCard cardNumber={cardNumber} cardHolder={cardHolder} />
    <section className="mt-6"><h3 className="text-sm font-black">مرحلهٔ ۳: ثبت رسید</h3><label className="mt-4 grid gap-2 text-xs font-bold">شماره پیگیری پرداخت<input required minLength={4} maxLength={100} dir="ltr" value={reference} onChange={(event) => setReference(event.target.value)} className="input" placeholder="مثلاً 123456" /></label><label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-violet/45 px-4 text-center text-sm font-bold"><Upload aria-hidden="true" size={21} className="text-violet" />{receipt ? receipt.name : "آپلود رسید پرداخت (JPG، PNG، WEBP یا PDF تا ۵MB)"}<input hidden required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setReceipt(event.target.files?.[0] ?? null)} /></label></section>
    {message && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{message}</p>}<button disabled={busy} className="button-primary mt-5 h-12 w-full">{busy && <LoaderCircle aria-hidden="true" size={18} className="animate-spin" />}ثبت سفارش و ارسال رسید</button>
  </form>;
}
