"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function PromptRating({ promptId, average, count }: { promptId: string; average: number; count: number }) {
  const [current, setCurrent] = useState(0);
  const [summary, setSummary] = useState({ average, count });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function rate(rating: number) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/prompts/${promptId}/rating`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating }) });
      const body = await response.json();
      if (response.status === 401) { window.location.assign("/login"); return; }
      if (!response.ok) throw new Error(body.error || "ثبت امتیاز انجام نشد.");
      setCurrent(rating);
      setSummary({ average: Number(body.rating_average), count: Number(body.rating_count) });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ثبت امتیاز انجام نشد.");
    } finally { setBusy(false); }
  }

  return <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-3 dark:border-white/10">
    <div className="flex items-center gap-0.5" role="group" aria-label="امتیازدهی به پرامپت">
      {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" disabled={busy} onClick={() => rate(rating)} className="grid size-7 place-items-center rounded-lg text-amber-500 transition hover:scale-110 disabled:opacity-60" aria-label={`امتیاز ${rating} از ۵`}><Star aria-hidden="true" size={17} fill={rating <= current ? "currentColor" : "none"} /></button>)}
    </div>
    <span className="text-[10px] font-bold text-black/55 dark:text-white/55">{summary.count ? `${summary.average.toLocaleString("fa-IR")} از ۵ · ${summary.count.toLocaleString("fa-IR")} رأی` : "اولین امتیاز را ثبت کنید"}</span>
    {message ? <p role="alert" className="basis-full text-[10px] text-red-600 dark:text-red-300">{message}</p> : null}
  </div>;
}
