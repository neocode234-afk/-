"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { categories } from "@/lib/categories";

export function PromptFilters() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const isKnownCategory = categories.some((item) => item === selectedCategory);
  const [category, setCategory] = useState(isKnownCategory ? selectedCategory! : "All");

  useEffect(() => {
    setCategory(isKnownCategory ? selectedCategory! : "All");
  }, [isKnownCategory, selectedCategory]);

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>("[data-prompt-card]");
    let visible = 0;
    cards.forEach((card) => {
      const matches = category === "All" || card.dataset.category === category;
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    const empty = document.querySelector<HTMLElement>("[data-prompt-empty]");
    if (empty) empty.hidden = visible > 0;
  }, [category]);

  return <>
    <div id="categories" className="-mx-3 mb-7 flex gap-2 overflow-x-auto px-3 pb-2 min-[480px]:-mx-4 min-[480px]:px-4 sm:mx-0 sm:mb-9 sm:px-0">
      {categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`chip ${category === item ? "chip-active" : ""}`}>{item === "All" ? "همه" : item}</button>)}
    </div>
    <div data-prompt-empty hidden className="rounded-[2rem] border border-dashed border-black/20 py-20 text-center dark:border-white/20">
      <p className="text-xl font-black">چیزی در این دسته پیدا نشد.</p>
      <button type="button" onClick={() => setCategory("All")} className="mt-3 text-sm font-bold text-violet">نمایش همهٔ پرامپت‌ها</button>
    </div>
  </>;
}
