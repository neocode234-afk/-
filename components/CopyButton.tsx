import { Copy } from "lucide-react";

export function CopyButton({ promptId, compact = false }: { promptId: string; compact?: boolean }) {
  return <button type="button" data-copy-prompt data-prompt-id={promptId} className={`button-primary ${compact ? "h-10 px-4 text-xs" : "h-12 px-6 text-sm font-bold"}`}>
    <Copy aria-hidden="true" size={16} /> <span data-copy-label>کپی پرامپت</span>
  </button>;
}
