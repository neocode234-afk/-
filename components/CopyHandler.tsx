"use client";

import { useEffect, useState } from "react";

export function CopyHandler() {
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function copy(event: MouseEvent) {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-copy-prompt]");
      if (!button || button.disabled) return;
      const promptId = button.dataset.promptId;
      const label = button.querySelector<HTMLElement>("[data-copy-label]");
      const initialLabel = label?.textContent;
      if (!promptId) return;

      button.disabled = true;
      if (label) label.textContent = "در حال کپی...";
      try {
        const response = await fetch(`/api/prompts/${promptId}`);
        const data = await response.json();
        if (!response.ok || !data.prompt_text) throw new Error("Prompt unavailable");
        await navigator.clipboard.writeText(data.prompt_text);
        if (label) label.textContent = "کپی شد ✓";
        setNotice("پرامپت در کلیپ‌بورد کپی شد ✓");
      } catch {
        if (label) label.textContent = "خطا در کپی";
        setNotice("کپی ناموفق بود");
      }
      timer = setTimeout(() => {
        if (label && initialLabel) label.textContent = initialLabel;
        button.disabled = false;
        setNotice("");
      }, 2200);
    }

    document.addEventListener("click", copy);
    return () => { document.removeEventListener("click", copy); if (timer) clearTimeout(timer); };
  }, []);

  return notice ? <div role="status" aria-live="polite" className="toast fixed bottom-24 left-1/2 z-[100] max-w-[calc(100%_-_2rem)] rounded-full bg-ink px-5 py-3 text-center text-sm text-white shadow-2xl sm:bottom-28 dark:bg-white dark:text-ink">{notice}</div> : null;
}
