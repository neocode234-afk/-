"use client";

import Image from "next/image";
import { Check, Copy, Headset, MessageSquareText, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const consultantPhone = "09337239401";
const displayPhone = "۰۹۳۳ ۷۲۳ ۹۴۰۱";

function tehranTime(date = new Date()) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", hour: "2-digit", hourCycle: "h23" }).format(date));
}

function getSupportState() {
  const hour = tehranTime();
  return { online: hour >= 15 && hour < 21, greeting: hour < 12 ? "صبح بخیر 👋" : hour < 18 ? "عصر بخیر 👋" : "شب بخیر 👋" };
}

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(false);
  const [greeting, setGreeting] = useState("سلام 👋");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [attention, setAttention] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateStatus = () => { const next = getSupportState(); setOnline(next.online); setGreeting(next.greeting); };
    updateStatus();
    setAttention(sessionStorage.getItem("aliprompt-support-opened") !== "1");
    const timer = window.setInterval(updateStatus, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => { if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOnOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  function markOpened() {
    sessionStorage.setItem("aliprompt-support-opened", "1");
    setAttention(false);
  }

  function toggle() { setNotice(""); setOpen((value) => { const next = !value; if (next) markOpened(); return next; }); }

  async function copyPhone(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    try { await navigator.clipboard.writeText(consultantPhone); setCopied(true); window.setTimeout(() => setCopied(false), 2_000); }
    catch { setNotice("کپی شماره انجام نشد؛ لطفاً شماره را دستی وارد کنید."); }
  }

  function openTicket() { window.location.assign("/tickets"); }

  function callConsultant() { window.location.assign(`tel:${consultantPhone}`); }

  return <div ref={wrapper} className="support-widget">
    {open ? <section id="aliprompt-support-popover" role="dialog" aria-label="پشتیبانی و مشاوره AliPrompt" className="support-popover">
      <header className="flex items-start justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10"><div><p className="text-xs font-bold text-violet">{greeting}</p><h2 className="mt-1 text-base font-black">پشتیبانی AliPrompt</h2><p className="mt-1 text-xs text-black/60 dark:text-white/60">چطور می‌تونیم کمکت کنیم؟</p></div><div className="flex items-start gap-2"><span className={`support-status ${online ? "support-status-online" : ""}`}><i aria-hidden="true" />{online ? "آنلاین" : "آفلاین"}</span><button type="button" onClick={() => setOpen(false)} className="icon-button size-9" aria-label="بستن پشتیبانی"><X aria-hidden="true" size={17} /></button></div></header>
      <div role="link" tabIndex={0} onClick={callConsultant} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); callConsultant(); } }} className="support-option mt-4 cursor-pointer">
        <span className="support-option-icon bg-violet/12 text-violet"><Headset aria-hidden="true" size={20} /></span><span className="min-w-0 flex-1 text-right"><b className="block text-sm">تماس با مشاور خرید</b><span dir="ltr" className="mt-1 block text-sm font-black tracking-wide text-ink dark:text-white">{displayPhone}</span><span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-black/60 dark:text-white/60"><i aria-hidden="true" className={`size-2 rounded-full ${online ? "bg-emerald-500" : "bg-black/35 dark:bg-white/35"}`} />{online ? "مشاور خرید آنلاین است" : "مشاور در حال حاضر آفلاین است"}</span><small className="mt-1 block text-[10px] text-black/45 dark:text-white/45">{online ? "پاسخ‌گویی تا ساعت ۲۱" : "ساعت پاسخ‌گویی: ۱۵ الی ۲۱"}</small></span>
        <span className="flex shrink-0 flex-col gap-1"><a href={`tel:${consultantPhone}`} onClick={(event) => event.stopPropagation()} className="support-mini-action" aria-label="تماس با مشاور"><Phone aria-hidden="true" size={14} />تماس</a><button type="button" onClick={copyPhone} className="support-mini-action" aria-label="کپی شماره مشاور">{copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}{copied ? "کپی شد ✓" : "کپی"}</button></span>
      </div>
      {!online ? <p className="support-offline-note">الان در دسترس نیستیم؛ می‌تونی تیکت بذاری 👋</p> : null}
      <button type="button" onClick={openTicket} className={`support-option mt-2 ${!online ? "support-option-emphasis" : ""}`}><span className="support-option-icon bg-acid/25 text-ink"><MessageSquareText aria-hidden="true" size={20} /></span><span className="min-w-0 flex-1 text-right"><b className="block text-sm">ارسال تیکت</b><small className="mt-1 block text-[11px] font-medium text-black/60 dark:text-white/60">درخواست خود را ثبت کنید تا بررسی شود</small></span></button>
      {notice ? <p role="status" className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">{notice}</p> : null}
    </section> : null}
    <button type="button" onClick={toggle} className={`support-trigger ${open ? "support-trigger-active" : ""} ${attention ? "support-attention" : ""}`} aria-label="پشتیبانی و مشاوره" aria-expanded={open} aria-controls="aliprompt-support-popover" aria-haspopup="dialog"><span className="support-tooltip">پشتیبانی و مشاوره</span>{attention ? <span className="support-badge" aria-label="یک پیام جدید">۱</span> : null}<Image src="/images/brand/support-consultation.png" alt="" fill sizes="64px" className="object-cover object-[43%_42%]" /></button>
  </div>;
}
