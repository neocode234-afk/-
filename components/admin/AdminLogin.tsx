"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error); setBusy(false); return; }
    router.replace("/admin");
    router.refresh();
  }

  return <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-md place-items-center px-4 py-8 sm:min-h-[70vh] sm:px-6">
    <form onSubmit={submit} className="surface w-full rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-8">
      <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-violet text-white sm:size-12"><LockKeyhole aria-hidden="true" /></span>
      <h1 className="text-2xl font-black sm:text-3xl">ورود مدیر</h1><p className="mb-6 mt-2 text-sm leading-7 text-black/60 sm:mb-7 dark:text-white/60">پنل مدیریت AliPrompt</p>
      <label className="mb-2 block text-xs font-bold">ایمیل</label><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input mb-5" />
      <label className="mb-2 block text-xs font-bold">رمز عبور</label><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="input" />
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
      <button disabled={busy} className="button-primary mt-6 h-12 w-full">{busy && <LoaderCircle className="animate-spin" size={18} />} ورود</button>
    </form>
  </div>;
}
