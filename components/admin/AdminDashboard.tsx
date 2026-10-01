"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CheckCircle2, Clipboard, Copy, Eye, FilePenLine, LoaderCircle, LogOut, Pencil, Plus, Search, Star, Trash2, Upload, X } from "lucide-react";
import type { Prompt } from "@/lib/types";
import { categories } from "@/lib/categories";
import type { AccountOrder } from "@/backend/modules/orders/repository";
import type { AdminUser } from "@/backend/modules/users/repository";
import type { Ticket } from "@/backend/modules/tickets/repository";
import { AdminOrders } from "./AdminOrders";
import { AdminUsers } from "./AdminUsers";
import { AdminTickets } from "./AdminTickets";

const blank = { title: "", slug: "", description: "", prompt_text: "", category: "Portrait", tags: "", image_url: "", status: "published" as "published" | "draft" };
type Form = typeof blank;
type StatusFilter = "all" | Form["status"];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export function AdminDashboard({ initial, orders, users, tickets, email }: { initial: Prompt[]; orders: AccountOrder[]; users: AdminUser[]; tickets: Ticket[]; email: string }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");

  const shown = useMemo(() => items.filter((item) => {
    const matchesQuery = `${item.title} ${item.description} ${item.category} ${item.tags.join(" ")}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
    return matchesQuery && (category === "All" || item.category === category) && (status === "all" || item.status === status);
  }), [items, query, category, status]);

  const published = items.filter((item) => item.status === "published").length;
  const drafts = items.length - published;
  const ratingCount = items.reduce((total, item) => total + item.rating_count, 0);

  function openNew() { setEditing(null); setForm(blank); setFile(null); setError(""); setModal(true); }
  function openEdit(item: Prompt) { setEditing(item); setForm({ title: item.title, slug: item.slug, description: item.description, prompt_text: item.prompt_text, category: item.category, tags: item.tags.join(", "), image_url: item.image_url, status: item.status }); setFile(null); setError(""); setModal(true); }
  function duplicate(item: Prompt) { setEditing(null); setFile(null); setError(""); setForm({ title: `${item.title} Copy`, slug: `${item.slug}-copy-${Date.now().toString().slice(-4)}`, description: item.description, prompt_text: item.prompt_text, category: item.category, tags: item.tags.join(", "), image_url: item.image_url, status: "draft" }); setModal(true); }
  function resetFilters() { setQuery(""); setCategory("All"); setStatus("all"); }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      let imageUrl = form.image_url;
      if (file) {
        const uploadForm = new FormData(); uploadForm.append("file", file);
        const uploadResponse = await fetch("/api/admin/upload", { method: "POST", body: uploadForm });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.error);
        imageUrl = uploadData.url;
      }
      if (!imageUrl) throw new Error("تصویر را انتخاب کنید");
      const payload = { ...form, image_url: imageUrl, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
      const response = await fetch(editing ? `/api/admin/prompts/${editing.id}` : "/api/admin/prompts", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const listResponse = await fetch("/api/admin/prompts");
      setItems(await listResponse.json()); setModal(false); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "خطا در ذخیره"); } finally { setBusy(false); }
  }

  async function remove(item: Prompt) {
    if (!confirm(`«${item.title}» حذف شود؟`)) return;
    const response = await fetch(`/api/admin/prompts/${item.id}`, { method: "DELETE" });
    if (response.ok) { setItems((current) => current.filter((entry) => entry.id !== item.id)); router.refresh(); }
  }
  async function copySlug(slug: string) { await navigator.clipboard.writeText(slug); setCopiedSlug(slug); setTimeout(() => setCopiedSlug(""), 1600); }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }

  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <header className="mb-8 flex flex-col justify-between gap-5 sm:mb-9 sm:flex-row sm:items-end">
      <div><span className="eyebrow">ALIPROMPT ADMIN</span><h1 className="mt-2 text-3xl font-black sm:text-4xl">مدیریت پرامپت‌ها</h1><p className="mt-2 text-xs text-black/55 dark:text-white/55">{email}</p></div>
      <div className="flex gap-2"><button type="button" onClick={logout} className="icon-button size-11 sm:size-12" aria-label="خروج از پنل"><LogOut aria-hidden="true" size={18} /></button><button type="button" onClick={openNew} className="button-accent h-11 px-4 sm:h-12 sm:px-5"><Plus aria-hidden="true" size={18} /> افزودن پرامپت</button></div>
    </header>

    <section aria-label="آمار پرامپت‌ها" className="mb-7 grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4 sm:gap-4">
      <Stat icon={<BarChart3 aria-hidden="true" size={19} />} label="همهٔ پرامپت‌ها" value={items.length} tone="violet" />
      <Stat icon={<CheckCircle2 aria-hidden="true" size={19} />} label="منتشرشده" value={published} tone="green" />
      <Stat icon={<FilePenLine aria-hidden="true" size={19} />} label="پیش‌نویس" value={drafts} tone="amber" />
      <Stat icon={<Star aria-hidden="true" size={19} />} label="همهٔ امتیازها" value={ratingCount} tone="violet" />
    </section>

    <section className="surface mb-6 rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_150px_auto] lg:items-center">
        <div className="relative"><Search aria-hidden="true" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/45 dark:text-white/50" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو در عنوان، تگ و دسته‌بندی..." className="control pr-12" /></div>
        <select aria-label="فیلتر دسته‌بندی" value={category} onChange={(event) => setCategory(event.target.value)} className="input"><option value="All">همهٔ دسته‌ها</option>{categories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="فیلتر وضعیت" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="input"><option value="all">همهٔ وضعیت‌ها</option><option value="published">منتشرشده</option><option value="draft">پیش‌نویس</option></select>
        <button type="button" onClick={resetFilters} className="button-ghost h-12 px-4">پاک‌کردن فیلتر</button>
      </div>
      <p className="mt-3 text-xs text-black/60 dark:text-white/60">نمایش {shown.length} مورد از {items.length} پرامپت</p>
    </section>

    <section className="surface overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem]">
      {shown.length ? shown.map((item) => <article key={item.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 border-b border-black/5 p-3 last:border-0 sm:grid-cols-[70px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-4 dark:border-white/5">
        <div className="relative size-14 overflow-hidden rounded-xl sm:size-[70px]"><Image src={item.image_url} alt="" fill className="object-cover" sizes="70px" /></div>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><b className="truncate text-sm sm:text-base">{item.title}</b><StatusBadge status={item.status} /></div><p className="mt-1 line-clamp-1 text-xs text-black/55 dark:text-white/55">{item.description}</p><div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-black/55 dark:text-white/55"><span dir="ltr" className="truncate">/{item.slug}</span><button type="button" onClick={() => copySlug(item.slug)} className="icon-button size-7 shrink-0" aria-label="کپی Slug">{copiedSlug === item.slug ? <CheckCircle2 aria-hidden="true" size={14} className="text-green-600" /> : <Copy aria-hidden="true" size={14} />}</button><span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-amber-700 dark:text-amber-300"><Star aria-hidden="true" size={12} fill="currentColor" />{item.rating_average.toLocaleString("fa-IR")} · {item.rating_count.toLocaleString("fa-IR")} رأی</span></div></div>
        <div className="col-span-2 flex flex-wrap gap-1 border-t border-black/5 pt-3 sm:col-span-1 sm:border-0 sm:pt-0 dark:border-white/5"><button type="button" onClick={() => window.open(`/prompts/${item.slug}`, "_blank", "noopener,noreferrer")} className="icon-button" aria-label="پیش‌نمایش"><Eye aria-hidden="true" size={17} /></button><button type="button" onClick={() => duplicate(item)} className="icon-button" aria-label="تکثیر پرامپت"><Clipboard aria-hidden="true" size={17} /></button><button type="button" onClick={() => openEdit(item)} className="icon-button" aria-label="ویرایش"><Pencil aria-hidden="true" size={17} /></button><button type="button" onClick={() => remove(item)} className="icon-button text-red-600 hover:bg-red-50 dark:text-red-300" aria-label="حذف"><Trash2 aria-hidden="true" size={17} /></button></div>
      </article>) : <div className="px-5 py-20 text-center"><p className="text-lg font-black">پرامپتی پیدا نشد.</p><button type="button" onClick={resetFilters} className="mt-3 text-sm font-bold text-violet">پاک‌کردن فیلترها</button></div>}
    </section>

    <AdminOrders initial={orders} />
    <AdminTickets initial={tickets} />
    <AdminUsers initial={users} />

    {modal && <div role="dialog" aria-modal="true" aria-labelledby="prompt-form-title" className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4"><div className="mx-auto my-4 max-w-2xl rounded-[1.5rem] bg-paper p-5 shadow-2xl sm:my-8 sm:rounded-[2rem] sm:p-8 dark:bg-[#191917]"><div className="mb-6 flex items-center justify-between sm:mb-7"><div><h2 id="prompt-form-title" className="text-xl font-black sm:text-2xl">{editing ? "ویرایش پرامپت" : "پرامپت جدید"}</h2><p className="mt-1 text-xs text-black/55 dark:text-white/55">فیلدهای ستاره‌دار الزامی هستند.</p></div><button type="button" onClick={() => setModal(false)} className="icon-button" aria-label="بستن"><X aria-hidden="true" size={18} /></button></div>
      <form onSubmit={save} className="grid gap-4 sm:gap-5"><Field label="عنوان"><input required className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: editing ? form.slug : slugify(event.target.value) })} /></Field><Field label="Slug انگلیسی"><input required dir="ltr" className="input" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} /></Field><Field label="توضیح"><textarea required rows={2} className="input py-3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><Field label="متن کامل پرامپت"><textarea required dir="ltr" rows={7} className="input py-3" value={form.prompt_text} onChange={(event) => setForm({ ...form, prompt_text: event.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="دسته‌بندی"><select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="وضعیت"><select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Form["status"] })}><option value="published">منتشرشده</option><option value="draft">پیش‌نویس</option></select></Field></div><Field label="تگ‌ها با کاما"><input dir="ltr" className="input" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="cinematic, portrait" /></Field><Field label={editing ? "تعویض تصویر (اختیاری)" : "تصویر"}><label className="flex min-h-24 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-black/20 px-4 text-center text-sm dark:border-white/20"><Upload aria-hidden="true" size={18} />{file ? file.name : "JPG / PNG / WEBP تا ۸MB"}<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>{form.image_url && !file && <p className="mt-2 truncate text-xs text-black/55 dark:text-white/55">تصویر فعلی: {form.image_url}</p>}</Field>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p>}<button disabled={busy} className="button-primary h-12 w-full">{busy && <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />} {editing ? "ذخیرهٔ تغییرات" : "انتشار پرامپت"}</button></form>
    </div></div>}
  </div>;
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "violet" | "green" | "amber" }) {
  const styles = { violet: "bg-violet/10 text-violet", green: "bg-green-500/10 text-green-700 dark:text-green-300", amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300" };
  return <div className="surface flex items-center gap-3 rounded-2xl p-4"><span className={`grid size-10 place-items-center rounded-xl ${styles[tone]}`}>{icon}</span><div><span className="block text-xs text-black/60 dark:text-white/60">{label}</span><b className="text-2xl font-black">{value}</b></div></div>;
}
function StatusBadge({ status }: { status: Prompt["status"] }) { return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status === "published" ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}`}>{status === "published" ? "منتشر" : "پیش‌نویس"}</span>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-xs font-bold">{label}{children}</label>; }
