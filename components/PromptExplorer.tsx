"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { categories } from "@/lib/categories";
import type { PromptPreview } from "@/lib/types";
import { PromptCard } from "./PromptCard";

export function PromptExplorer({ prompts }: { prompts: PromptPreview[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const items = useMemo(() => prompts.filter((prompt) => (category === "All" || prompt.category === category) && `${prompt.title} ${prompt.description} ${prompt.category} ${prompt.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query, category, prompts]);

  return <section id="prompts" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
    <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div><span className="eyebrow mb-3">Explore the library</span><h2 className="text-3xl font-black tracking-tight sm:text-5xl">پرامپت مناسب را پیدا کن.</h2></div>
      <div id="search" className="relative w-full md:w-80"><Search aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/60" size={18} /><input aria-label="جستجو میان پرامپت‌ها" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو میان پرامپت‌ها..." className="control h-13 pl-11 pr-12" />{query && <button type="button" aria-label="پاک‌کردن جستجو" onClick={() => setQuery("")} className="icon-button absolute left-2 top-1/2 size-8 -translate-y-1/2"><X aria-hidden="true" size={16} /></button>}</div>
    </div>
    <div id="categories" className="mb-9 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`chip ${category === item ? "chip-active" : ""}`}>{item === "All" ? "همه" : item}</button>)}</div>
    {items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item, index) => <PromptCard key={item.id} item={item} index={index} />)}</div> : <div className="rounded-[2rem] border border-dashed border-black/20 py-24 text-center dark:border-white/20"><p className="text-xl font-black">چیزی پیدا نشد.</p><p className="mt-2 text-sm text-black/55 dark:text-white/60">عبارت جست‌وجو یا فیلترها را بررسی کنید.</p><button type="button" onClick={() => { setQuery(""); setCategory("All"); }} className="mt-3 text-sm text-violet">پاک‌کردن فیلترها</button></div>}
  </section>;
}
