import Image from "next/image";

const posters = [
  { src: "/images/posters/chatgpt-plus.jpg", alt: "پوستر ChatGPT Plus" },
  { src: "/images/posters/claude-pro.jpg", alt: "پوستر Claude Pro" },
  { src: "/images/posters/spotify-premium.jpg", alt: "پوستر Spotify Premium" },
  { src: "/images/posters/all-accounts.jpg", alt: "پوستر مقایسه اشتراک‌ها" },
];

export function PosterGallery() {
  return (
    <section aria-labelledby="posters-title" className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="mb-7 flex items-end justify-between gap-5">
        <div>
          <span className="eyebrow mb-2">Special offers</span>
          <h2 id="posters-title" className="text-3xl font-black tracking-tight sm:text-4xl">پوسترهای ویژه</h2>
        </div>
        <p className="hidden max-w-xs text-left text-sm leading-6 text-black/70 dark:text-white/70 sm:block">برای مشاهدهٔ کامل، هر پوستر را باز کنید.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {posters.map((poster) => (
          <a key={poster.src} href={poster.src} target="_blank" rel="noreferrer" aria-label={`مشاهدهٔ کامل ${poster.alt}`} className="block overflow-hidden bg-black transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <Image src={poster.src} alt={poster.alt} width={720} height={1280} sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" quality={82} loading="lazy" className="h-auto w-full" />
          </a>
        ))}
      </div>
    </section>
  );
}
