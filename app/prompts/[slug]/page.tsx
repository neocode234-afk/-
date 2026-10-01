import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getPromptBySlug, getPrompts } from "@/lib/queries";
import { CopyButton } from "@/components/CopyButton";
import { PromptCard } from "@/components/PromptCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) return {};
  return { title: prompt.title, description: prompt.description, openGraph: { title: prompt.title, description: prompt.description, images: [prompt.image_url] } };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [prompt, allPrompts] = await Promise.all([getPromptBySlug(slug), getPrompts()]);
  if (!prompt) notFound();

  const similar = allPrompts.filter((item) => item.id !== prompt.id && (item.category === prompt.category || item.tags.some((tag) => prompt.tags.includes(tag)))).slice(0, 3);
  const fallback = allPrompts.filter((item) => item.id !== prompt.id && !similar.includes(item)).slice(0, 3 - similar.length);
  const related = [...similar, ...fallback];

  return <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
    <Link href="/#prompts" className="mb-6 inline-flex items-center gap-2 text-sm text-black/60 transition hover:text-violet sm:mb-8 dark:text-white/60"><ArrowRight aria-hidden="true" size={16} /> بازگشت به کتابخانه</Link>
    <section className="grid gap-7 sm:gap-8 lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative min-h-[360px] overflow-hidden rounded-[1.75rem] sm:min-h-[520px] sm:rounded-[2.5rem] lg:min-h-[720px]">
        <Image src={prompt.image_url} alt={prompt.title} fill priority className="object-cover" sizes="(max-width:1024px) 100vw, 55vw" />
      </div>
      <div className="flex min-w-0 flex-col justify-center lg:px-8">
        <span className="mb-4 w-fit rounded-full bg-violet px-4 py-2 text-xs font-bold text-white sm:mb-5">{prompt.category}</span>
        <h1 className="break-words text-3xl font-black leading-tight tracking-tight sm:text-6xl">{prompt.title}</h1>
        <p className="mt-4 text-sm leading-7 text-black/70 sm:mt-5 sm:text-base sm:leading-8 dark:text-white/70">{prompt.description}</p>
        <div className="my-6 flex flex-wrap gap-2 sm:my-7">{prompt.tags.map((tag) => <span key={tag} className="rounded-full border border-black/10 px-3 py-1.5 text-xs dark:border-white/15">#{tag}</span>)}</div>
        <div className="surface rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-6">
          <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><span className="text-xs font-black uppercase tracking-wider text-violet">Full prompt</span><CopyButton promptId={prompt.id} compact /></div>
          <p dir="ltr" className="break-words text-left text-sm leading-7 text-black/70 dark:text-white/70">{prompt.prompt_text}</p>
        </div>
      </div>
    </section>
    {related.length > 0 && <section className="pt-14 sm:pt-24"><h2 className="mb-6 text-2xl font-black sm:mb-8 sm:text-3xl">پرامپت‌های مشابه</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item, index) => <PromptCard key={item.id} item={item} index={index} />)}</div></section>}
  </div>;
}
