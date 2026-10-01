import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/backend/modules/users/session";
import { getAccountOrdersByUserId } from "@/backend/modules/orders/repository";
import { getTicketsForUser } from "@/backend/modules/tickets/repository";
import { UserDashboard } from "@/components/UserDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "پنل کاربری", description: "مدیریت حساب و سفارش‌های AliPrompt." };

export default async function DashboardPage() {
  const session = await getUserSession();
  if (!session?.sub) redirect("/login");
  const [orders, tickets] = await Promise.all([getAccountOrdersByUserId(String(session.sub)), getTicketsForUser(Number(session.sub))]);
  return <UserDashboard name={String(session.name || "کاربر AliPrompt")} phone={String(session.phone || "")} orders={orders} tickets={tickets} />;
}
