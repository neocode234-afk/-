"use client";

import { Check, Copy, CreditCard } from "lucide-react";
import { useState } from "react";

export function PaymentCard({ cardNumber, cardHolder }: { cardNumber?: string; cardHolder?: string }) {
  const [copied, setCopied] = useState(false);
  const normalized = cardNumber?.replace(/\s|-/g, "") ?? "";
  const formatted = normalized ? normalized.replace(/(\d{4})(?=\d)/g, "$1-") : "تنظیم نشده";
  async function copyCard() { if (!normalized) return; await navigator.clipboard.writeText(normalized); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }

  return <section className="overflow-hidden rounded-[1.75rem] border border-violet/20 bg-violet/[.035] p-5 sm:p-6">
    <div className="mb-5 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-violet text-white"><CreditCard aria-hidden="true" size={21} /></span><div><h2 className="text-xl font-black">مرحلهٔ ۲: پرداخت کارت‌به‌کارت</h2><p className="mt-1 text-sm text-black/65 dark:text-white/65">مبلغ را به کارت زیر منتقل کنید.</p></div></div>
    {normalized ? <><div className="rounded-[1.35rem] bg-ink p-5 text-white"><span className="text-xs font-bold tracking-[.16em] text-white/55">شماره کارت مقصد</span><p dir="ltr" className="mt-3 text-center text-xl font-black tracking-[.09em] sm:text-2xl">{formatted}</p><p className="mt-3 text-center text-sm text-white/70">به نام {cardHolder || "—"}</p></div><button type="button" onClick={copyCard} className="button-accent mt-4 w-full">{copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}{copied ? "شماره کارت کپی شد" : "کپی شماره کارت"}</button></> : <p className="rounded-xl border border-dashed border-violet/40 p-4 text-sm leading-7 text-black/70 dark:text-white/70">اطلاعات کارت مقصد هنوز تنظیم نشده است.</p>}
  </section>;
}
