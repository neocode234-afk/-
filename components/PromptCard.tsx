import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import type { PromptPreview } from "@/lib/types";
import { CopyButton } from "./CopyButton";

export function PromptCard({ item, index }: { item: PromptPreview; index: number }) {
  return <article style={index > 3 ? { contentVisibility: "auto", containIntrinsicSize: "540px" } : undefined} className="surface-card group">
    <Link href={`/prompts/${item.slug}`} aria-label={`مشاهده پرامپت ${item.title}`} className="relative block aspect-[4/5] overflow-hidden rounded-[1.35rem]">
      <Image src={item.image_url} alt={item.title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" priority={index === 0} />
      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-ink shadow-sm">{item.category}</span>
    </Link>
    <div className="p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <Link href={`/prompts/${item.slug}`} aria-label={`مشاهده پرامپت ${item.title}`}><h3 className="text-lg font-black leading-tight">{item.title}</h3></Link>
        <Link href={`/prompts/${item.slug}`} aria-label={`مشاهده پرامپت ${item.title}`} className="icon-button size-9 shrink-0 group-hover:bg-acid group-hover:text-ink"><ArrowUpLeft aria-hidden="true" size={16} /></Link>
      </div>
      <p className="mb-4 min-h-10 text-sm leading-6 text-black/70 dark:text-white/70">{item.description}</p>
      <div className="mb-5 flex flex-wrap gap-1.5">{item.tags.slice(0, 3).map((tag) => <span key={tag} className="tag">#{tag}</span>)}</div>
      <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10"><span className="text-xs text-black/60 dark:text-white/60">۰{index + 1} / PROMPT</span><CopyButton promptId={item.id} compact /></div>
    </div>
  </article>;
}
