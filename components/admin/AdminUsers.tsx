"use client";

import { useMemo, useState } from "react";
import { Search, Star, UsersRound } from "lucide-react";
import type { AdminUser } from "@/backend/modules/users/repository";

export function AdminUsers({ initial }: { initial: AdminUser[] }) {
  const [query, setQuery] = useState("");
  const users = useMemo(() => initial.filter((user) => `${user.name} ${user.phone}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [initial, query]);
  const date = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });

  return <section aria-labelledby="admin-users-title" className="mt-7">
    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><span className="eyebrow">MEMBERS</span><h2 id="admin-users-title" className="mt-1 text-2xl font-black">کاربران سایت</h2><p className="mt-1 text-xs text-black/55 dark:text-white/55">{initial.length.toLocaleString("fa-IR")} حساب ثبت‌شده و آمار فعالیت هر کاربر</p></div><label className="relative w-full sm:max-w-xs"><Search aria-hidden="true" size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/45 dark:text-white/45" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="control h-11 pr-11 text-xs" placeholder="جست‌وجوی نام یا شماره..." /></label></div>
    <div className="surface overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem]">{users.length ? users.map((user) => <article key={user.id} className="grid gap-3 border-b border-black/5 p-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5 sm:p-5 dark:border-white/5"><div className="min-w-0"><div className="flex items-center gap-2"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet/10 text-violet"><UsersRound aria-hidden="true" size={17} /></span><div className="min-w-0"><h3 className="truncate text-sm font-black sm:text-base">{user.name}</h3><p dir="ltr" className="mt-0.5 text-xs text-black/55 dark:text-white/55">{user.phone}</p></div></div></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-black/5 px-3 py-1.5 dark:bg-white/10">{user.order_count.toLocaleString("fa-IR")} سفارش</span><span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1.5 text-amber-700 dark:text-amber-300"><Star aria-hidden="true" size={13} fill="currentColor" />{user.rating_count.toLocaleString("fa-IR")} امتیاز</span></div><div className="text-xs text-black/55 dark:text-white/55"><p>عضویت: {date.format(new Date(user.created_at))}</p>{user.last_order_at ? <p className="mt-1">آخرین سفارش: {date.format(new Date(user.last_order_at))}</p> : null}</div></article>) : <div className="px-5 py-14 text-center text-sm text-black/60 dark:text-white/60">کاربری با این مشخصات پیدا نشد.</div>}</div>
  </section>;
}
