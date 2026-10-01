import Image from "next/image";
import Link from "next/link";
import { getUserSession } from "@/backend/modules/users/session";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { href: "/", label: "خانه" },
  { href: "/#prompts", label: "پرامپت‌ها" },
  { href: "/#categories", label: "دسته‌بندی‌ها" },
  { href: "/accounts?plan=all-accounts", label: "خرید اکانت" },
  { href: "/#about", label: "درباره ما" },
];

export async function Navbar() {
  const user = await getUserSession();
  const accountHref = user ? "/dashboard" : "/login";
  const accountLabel = user ? "پنل کاربری" : "ورود";

  return <header className="surface-nav sticky top-0 z-50">
    <nav aria-label="ناوبری اصلی" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:h-20 sm:px-6 lg:px-8">
      <Link href="/" aria-label="AliPrompt - صفحه اصلی" className="inline-flex shrink-0 items-center transition-transform hover:scale-[1.02]">
        <Image src="/images/brand/aliprompt-logo.avif" alt="AliPrompt" width={384} height={128} priority className="block h-8 w-auto object-contain sm:h-10 dark:hidden" />
        <span aria-hidden="true" className="brand-logo hidden dark:block" />
      </Link>
      <div className="hidden items-center gap-8 text-sm font-medium xl:flex">
        {navigation.map((item) => <Link key={item.href} href={item.href} className="transition-colors hover:text-violet">{item.label}</Link>)}
        <Link href={accountHref} className="text-violet transition-colors hover:text-ink dark:hover:text-white">{accountLabel}</Link>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link href={accountHref} className="button-primary hidden h-9 px-3 py-0 text-xs min-[480px]:inline-flex xl:hidden">{accountLabel}</Link>
        <ThemeToggle />
      </div>
    </nav>
  </header>;
}
