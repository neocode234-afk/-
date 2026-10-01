import { Sparkles } from "lucide-react";

export function Footer() {
  return <footer id="about" className="mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 sm:pt-24 lg:px-8">
    <div className="flex flex-col justify-between gap-7 rounded-[1.5rem] bg-ink p-6 text-white sm:flex-row sm:items-end sm:rounded-[2rem] sm:p-8">
      <div><div className="mb-4 flex items-center gap-2 text-xl font-black"><Sparkles aria-hidden="true" size={20} /> Aliprompt</div><p className="max-w-md text-sm leading-7 text-white/75">ایده‌های بهتر، خروجی‌های درخشان‌تر. مجموعه‌ای دست‌چین‌شده برای خلاقان عصر هوش مصنوعی.</p></div>
      <p className="text-xs leading-6 text-white/70">توسعه‌یافته توسط <span className="font-bold text-white">سید علیرضا امام</span> · © ۲۰۲۶</p>
    </div>
  </footer>;
}
