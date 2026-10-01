import Image from "next/image";
import Link from "next/link";
import type { PromptPreview } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { PromptRating } from "./PromptRating";

export function PromptCard({ item, index }: { item: PromptPreview; index: number }) {
  const searchable = `${item.title} ${item.description} ${item.category} ${item.tags.join(" ")}`.toLocaleLowerCase();
  return <article data-prompt-card data-category={item.category} data-search={searchable} style={index > 3 ? { contentVisibility: "auto", containIntrinsicSize: "540px" } : undefined} className="surface-card group flex min-h-[178px] rounded-[1.4rem] max-[359px]:min-h-[160px]">
    <Link href={`/prompts/${item.slug}`} aria-label={`مشاهده پرامپت ${item.title}`} className="relative order-2 block w-[41%] shrink-0 overflow-hidden rounded-[1.05rem]">
      <Image src={item.image_url} alt={item.title} fill sizes="(max-width:767px) 42vw, (max-width:1279px) 22vw, 16vw" className="object-cover transition duration-700 group-hover:scale-105" priority={index === 0} />
      <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-ink shadow-sm">{item.category}</span>
    </Link>
    <div className="order-1 flex min-w-0 flex-1 flex-col p-3.5 max-[359px]:p-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <Link href={`/prompts/${item.slug}`} aria-label={`مشاهده پرامپت ${item.title}`} className="min-w-0"><h3 className="break-words text-base font-black leading-tight">{item.title}</h3></Link>
      </div>
      <p className="mb-3 line-clamp-2 text-xs leading-5 text-black/70 dark:text-white/70">{item.description}</p>
      <div className="mt-auto"><div className="flex items-center justify-between gap-2 border-t border-black/10 pt-3 dark:border-white/10"><CopyButton promptId={item.id} compact /></div><PromptRating promptId={item.id} average={item.rating_average} count={item.rating_count} /></div>
    </div>
  </article>;
}
