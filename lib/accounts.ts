export type AccountPlanSlug = "chatgpt-plus" | "claude-pro";

export type AccountOffer = {
  slug: AccountPlanSlug | "all-accounts";
  title: string;
  description: string;
  features: string[];
};

export const accountOffers: AccountOffer[] = [
  {
    slug: "chatgpt-plus",
    title: "ChatGPT Plus",
    description: "دسترسی حرفه‌ای برای ایده‌پردازی، تولید محتوا و کارهای روزانه.",
    features: ["فعال‌سازی روی ایمیل شخصی", "پشتیبانی پس از خرید", "تحویل طبق هماهنگی"],
  },
  {
    slug: "claude-pro",
    title: "Claude Pro",
    description: "همراه حرفه‌ای برای تحلیل، نوشتن و کارهای خلاقانه.",
    features: ["فعال‌سازی روی ایمیل شخصی", "مناسب کارهای حرفه‌ای", "پشتیبانی پس از خرید"],
  },
  {
    slug: "all-accounts",
    title: "خرید اکانت",
    description: "سرویس مناسب را انتخاب کنید، مبلغ لحظه‌ای را ببینید و پس از ورود سفارش خود را ثبت کنید.",
    features: ["قیمت‌گذاری براساس نرخ دلار", "۱۲٪ تخفیف برای خرید اول", "پرداخت امن کارت‌به‌کارت"],
  },
];

export function getAccountOffer(slug?: string) {
  return accountOffers.find((offer) => offer.slug === slug) ?? accountOffers[2];
}

export function isAccountPlan(slug: string): slug is AccountPlanSlug {
  return slug === "chatgpt-plus" || slug === "claude-pro";
}

export function formatToman(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}
