import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { href: "/", label: "خانه" },
  { href: "/#prompts", label: "پرامپت‌ها" },
  { href: "/#categories", label: "دسته‌بندی‌ها" },
  { href: "/#about", label: "درباره ما" },
];

export function Navbar() {
  return <header className="surface-nav sticky top-0 z-50">
    <nav aria-label="ناوبری اصلی" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
      <Link href="/" aria-label="AliPrompt - صفحه اصلی" className="inline-flex shrink-0 items-center transition-transform hover:scale-[1.02]">
        <Image src="/images/brand/aliprompt-logo.png" alt="AliPrompt" width={174} height={58} priority className="block h-10 w-auto object-contain dark:invert dark:hue-rotate-180" />
      </Link>
      <div className="hidden items-center gap-8 text-sm font-medium md:flex">
        {navigation.map((item) => <Link key={item.href} href={item.href} className="transition-colors hover:text-violet">{item.label}</Link>)}
        <Link href="/login" className="text-violet transition-colors hover:text-ink dark:hover:text-white">ورود</Link>
      </div>
      <div className="flex items-center gap-2">
        <a href="/#search" aria-label="جستجو" className="icon-button"><Search aria-hidden="true" size={17} /></a>
        <Link href="/login" className="button-primary h-10 px-4 py-0 text-xs md:hidden">ورود</Link>
        <ThemeToggle />
      </div>
    </nav>
  </header>;
}
