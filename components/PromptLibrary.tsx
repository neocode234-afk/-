import type { PromptPreview } from "@/lib/types";
import { PromptCard } from "./PromptCard";
import { PromptFilters } from "./PromptFilters";

export function PromptLibrary({ prompts }: { prompts: PromptPreview[] }) {
  return <section id="prompts" className="mx-auto max-w-7xl px-3 py-7 min-[480px]:px-4 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
    <PromptFilters />
    <div className="grid gap-3 min-[480px]:gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3 2xl:grid-cols-4">{prompts.map((item, index) => <PromptCard key={item.id} item={item} index={index} />)}</div>
  </section>;
}
