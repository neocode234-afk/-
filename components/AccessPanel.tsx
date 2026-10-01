"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";

export function AccessPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(mode === "login" ? "/api/auth/access" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { phone, code: secret } : { name, phone, password: secret }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در درخواست");
      router.replace(data.admin ? "/admin" : "/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "اتصال برقرار نشد؛ دوباره تلاش کنید.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-md place-items-center px-4 py-8 sm:min-h-[70vh] sm:px-6 sm:py-10">
    <div className="surface w-full rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-8">
      <div className="mb-6 flex rounded-full bg-black/5 p-1 dark:bg-white/10">{(["login", "register"] as const).map((tab) => <button type="button" key={tab} onClick={() => { setMode(tab); setMessage(""); setSecret(""); }} className={`flex-1 rounded-full py-2.5 text-sm font-bold transition ${mode === tab ? "bg-white shadow dark:bg-white/15" : "text-black/60 dark:text-white/60"}`}>{tab === "login" ? "ورود" : "ثبت‌نام"}</button>)}</div>
      <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-violet text-white sm:size-12">{mode === "login" ? <LogIn aria-hidden="true" /> : <UserPlus aria-hidden="true" />}</span>
      <h1 className="text-2xl font-black sm:text-3xl">{mode === "login" ? "ورود به AliPrompt" : "ساخت حساب کاربری"}</h1>
      <p className="mb-6 mt-3 text-sm leading-7 text-black/60 sm:mb-7 dark:text-white/60">{mode === "login" ? "شماره موبایل و رمز عبور را وارد کنید." : "نام فارسی، شماره موبایل و رمز عبور خود را وارد کنید."}</p>
      <form onSubmit={submit} className="grid gap-4 sm:gap-5">
        {mode === "register" && <label className="grid gap-2 text-xs font-bold">نام و نام خانوادگی (فارسی)<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="input" placeholder="نام شما" /></label>}
        <label className="grid gap-2 text-xs font-bold">شماره موبایل<input type="tel" dir="ltr" required autoComplete="tel" maxLength={11} value={phone} onChange={(event) => setPhone(event.target.value)} className="input" placeholder="09xxxxxxxxx" /></label>
        <label className="grid gap-2 text-xs font-bold">رمز عبور<input dir="ltr" type="password" required autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={mode === "register" ? 8 : 4} maxLength={72} value={secret} onChange={(event) => setSecret(event.target.value)} className="input" />{mode === "register" && <span className="text-black/55 dark:text-white/55">حداقل ۸ کاراکتر؛ شماره موبایل در این نسخه با پیامک تأیید نمی‌شود.</span>}</label>
        {message && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{message}</p>}
        <button disabled={busy} className="button-primary h-12 w-full">{busy && <LoaderCircle className="animate-spin" size={18} />} {mode === "login" ? "ورود" : "ساخت حساب و ورود"}</button>
      </form>
    </div>
  </div>;
}
