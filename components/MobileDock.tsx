import Link from "next/link";
import { House, LayoutDashboard, Plus } from "lucide-react";
import { getUserSession } from "@/backend/modules/users/session";

export async function MobileDock() {
  const user = await getUserSession();
  const items = [
    { href: "/", label: "خانه", icon: House },
    { href: "/accounts?plan=all-accounts", label: "خرید اکانت", icon: Plus, featured: true },
    { href: user ? "/dashboard" : "/login", label: "پنل", icon: LayoutDashboard },
  ];

  return <nav aria-label="ناوبری پایین" className="mobile-dock">{items.map(({ href, label, icon: Icon, featured }) => <Link key={label} href={href} className={`mobile-dock-item ${featured ? "mobile-dock-featured" : ""}`}><span className="mobile-dock-icon"><Icon aria-hidden="true" size={featured ? 22 : 19} /></span><span className={featured ? "sr-only" : undefined}>{label}</span></Link>)}</nav>;
}
