import Link from "next/link";
import { ArrowUpLeft, ImageIcon, Layers3, MousePointerClick, Sparkles } from "lucide-react";
import type { PromptPreview } from "@/lib/types";

const paths = [
  { category: "Portrait", title: "پرتره‌های حرفه‌ای", copy: "نور، زاویه و استایل برای چهره‌هایی طبیعی و چشم‌گیر.", color: "bg-[#e8dcff] text-[#4b2ca2] dark:bg-[#2a1b4a] dark:text-[#dfd1ff]" },
  { category: "Couple", title: "لحظه‌های دونفره", copy: "ایده‌های صمیمی و دقیق برای عکس‌های خاطره‌انگیز.", color: "bg-[#ffe2e8] text-[#9b2849] dark:bg-[#4b1d2c] dark:text-[#ffc8d5]" },
  { category: "Cinematic", title: "فریم‌های سینمایی", copy: "کنترل رنگ، نور و عمق میدان برای روایت تصویری قوی.", color: "bg-[#dff3ed] text-[#176c57] dark:bg-[#123d34] dark:text-[#b8eadb]" },
  { category: "Fashion", title: "فشن و ادیتوریال", copy: "برای خروجی‌های تمیز، پرجزئیات و آماده‌ی انتشار.", color: "bg-[#fff1c9] text-[#775400] dark:bg-[#4c3a08] dark:text-[#ffe39a]" },
] as const;

export function PromptPaths({ prompts }: { prompts: PromptPreview[] }) {
  const categoryCount = new Set(prompts.map((prompt) => prompt.category)).size;

  return (
    <section aria-labelledby="paths-title" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="surface overflow-hidden rounded-[1.75rem] p-4 sm:rounded-[2.25rem] sm:p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-end dark:border-white/10">
          <div>
            <span className="eyebrow mb-2">Start with an idea</span>
            <h2 id="paths-title" className="text-3xl font-black tracking-tight sm:text-4xl">از کجا شروع کنیم؟</h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-black/70 dark:text-white/70">موضوعت را انتخاب کن؛ سپس متن آماده را با یک کلیک بردار و برای ایده‌ی خودت شخصی‌سازی کن.</p>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-2 xl:grid-cols-4">
          {paths.map((path) => (
            <Link key={path.category} href={`/?category=${encodeURIComponent(path.category)}#prompts`} className={`depth-tile group rounded-[1.35rem] p-4 sm:p-5 ${path.color}`}>
              <div className="mb-7 flex items-center justify-between"><ImageIcon aria-hidden="true" size={21} /><ArrowUpLeft aria-hidden="true" size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
              <h3 className="text-xl font-black">{path.title}</h3>
              <p className="mt-2 text-sm leading-6 opacity-80">{path.copy}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-3 border-t border-black/10 pt-5 sm:grid-cols-3 dark:border-white/10">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-violet/12 text-violet"><Layers3 aria-hidden="true" size={18} /></span><p className="text-sm font-bold"><b className="text-base text-violet">{prompts.length}</b> پرامپت آماده</p></div>
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-acid text-ink"><Sparkles aria-hidden="true" size={18} /></span><p className="text-sm font-bold"><b className="text-base">{categoryCount}</b> دسته‌بندی خلاق</p></div>
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-black/5 text-ink dark:bg-white/10 dark:text-white"><MousePointerClick aria-hidden="true" size={18} /></span><p className="text-sm font-bold">کپی در یک کلیک</p></div>
        </div>
      </div>
    </section>
  );
}
