"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyButtonProps = {
  text?: string;
  promptId?: string;
  compact?: boolean;
};

export function CopyButton({ text, promptId, compact = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function copy() {
    try {
      const promptText = text ?? (promptId ? (await (await fetch(`/api/prompts/${promptId}`)).json()).prompt_text : "");
      if (!promptText) throw new Error("Prompt unavailable");
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2200);
    }
  }

  return <>
    <button type="button" onClick={copy} className={`button-primary ${compact ? "h-10 px-4 text-xs" : "h-12 px-6 text-sm font-bold"}`}>
      {copied ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />} {copied ? "کپی شد ✓" : "کپی پرامپت"}
    </button>
    {(copied || error) && <div role="status" aria-live="polite" className="toast fixed bottom-6 left-1/2 z-[100] rounded-full bg-ink px-5 py-3 text-sm text-white shadow-2xl dark:bg-white dark:text-ink">{error ? "کپی ناموفق بود" : "پرامپت در کلیپ‌بورد کپی شد ✓"}</div>}
  </>;
}
