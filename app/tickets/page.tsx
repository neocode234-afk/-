import { redirect } from "next/navigation";
import { getUserSession } from "@/backend/modules/users/session";
import { getTicketsForUser } from "@/backend/modules/tickets/repository";
import { TicketCenter } from "@/components/TicketCenter";
export const dynamic = "force-dynamic";
export default async function TicketsPage() { const user = await getUserSession(); if (!user?.sub) redirect("/login"); return <TicketCenter initial={await getTicketsForUser(Number(user.sub))} />; }
