import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/backend/modules/auth/session";
import { getUserSession } from "@/backend/modules/users/session";
import { AppError, errorResponse, parseJson } from "@/backend/shared/errors";
import { limitRequest } from "@/backend/shared/rate-limit";
import { logEvent } from "@/backend/shared/logger";
import { addTicketMessage, createTicket, getMessages, getTicket, getTicketsForAdmin, getTicketsForUser, markRead, ticketPriorities, ticketStatuses, updateTicket } from "./repository";

const createSchema = z.object({ subject: z.string().trim().min(3).max(180), category: z.enum(["technical", "payment", "account", "feedback", "other"]), message: z.string().trim().min(5).max(5000) });
const messageSchema = z.object({ message: z.string().trim().min(1).max(5000) });
const updateSchema = z.object({ status: z.enum(ticketStatuses), priority: z.enum(ticketPriorities) });
const idOk = (value: string) => /^AP-\d{6}$/.test(value);

export async function createTicketController(request: Request) {
  try {
    const user = await getUserSession();
    if (!user?.sub) throw new AppError(401, "برای ارسال تیکت وارد حساب شوید.");
    limitRequest(request, `ticket-create:${user.sub}`, 3, 60_000);
    const parsed = createSchema.safeParse(await parseJson(request));
    if (!parsed.success) throw new AppError(400, "اطلاعات تیکت کامل نیست.");
    const ticketNumber = await createTicket(Number(user.sub), parsed.data.subject, parsed.data.category, parsed.data.message);
    logEvent("ticket.created", { ticketNumber, userId: user.sub, category: parsed.data.category });
    return NextResponse.json({ ticketNumber }, { status: 201 });
  } catch (error) { return errorResponse(error, "tickets/create"); }
}

export async function userTicketsController() {
  try {
    const user = await getUserSession();
    if (!user?.sub) throw new AppError(401, "Unauthorized");
    return NextResponse.json(await getTicketsForUser(Number(user.sub)));
  } catch (error) { return errorResponse(error, "tickets/list"); }
}

export async function userTicketController(request: Request, params: Promise<{ number: string }>) {
  try {
    const user = await getUserSession();
    if (!user?.sub) throw new AppError(401, "Unauthorized");
    const { number } = await params;
    if (!idOk(number)) throw new AppError(404, "تیکت پیدا نشد.");
    const ticket = await getTicket(number, Number(user.sub));
    if (!ticket) throw new AppError(404, "تیکت پیدا نشد.");
    if (request.method === "GET") {
      await markRead(ticket.id, "USER");
      return NextResponse.json({ ticket, messages: await getMessages(ticket.id) });
    }
    limitRequest(request, `ticket-reply:${user.sub}`, 10, 60_000);
    const parsed = messageSchema.safeParse(await parseJson(request));
    if (!parsed.success) throw new AppError(400, "متن پیام معتبر نیست.");
    await addTicketMessage(ticket, "USER", parsed.data.message);
    logEvent("ticket.replied", { ticketNumber: number, role: "user" });
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error, "tickets/item"); }
}

export async function adminTicketsController() {
  try {
    if (!await getSession()) throw new AppError(401, "Unauthorized");
    return NextResponse.json(await getTicketsForAdmin());
  } catch (error) { return errorResponse(error, "admin/tickets/list"); }
}

export async function adminTicketController(request: Request, params: Promise<{ number: string }>) {
  try {
    if (!await getSession()) throw new AppError(401, "Unauthorized");
    const { number } = await params;
    if (!idOk(number)) throw new AppError(404, "تیکت پیدا نشد.");
    const ticket = await getTicket(number);
    if (!ticket) throw new AppError(404, "تیکت پیدا نشد.");
    if (request.method === "GET") {
      await markRead(ticket.id, "ADMIN");
      return NextResponse.json({ ticket, messages: await getMessages(ticket.id) });
    }
    if (request.method === "POST") {
      const parsed = messageSchema.safeParse(await parseJson(request));
      if (!parsed.success) throw new AppError(400, "متن پیام معتبر نیست.");
      await addTicketMessage(ticket, "ADMIN", parsed.data.message);
      logEvent("ticket.replied", { ticketNumber: number, role: "admin" });
      return NextResponse.json({ ok: true });
    }
    const parsed = updateSchema.safeParse(await parseJson(request));
    if (!parsed.success) throw new AppError(400, "وضعیت یا اولویت معتبر نیست.");
    await updateTicket(ticket, parsed.data.status, parsed.data.priority);
    logEvent("ticket.updated", { ticketNumber: number, status: parsed.data.status, priority: parsed.data.priority });
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error, "admin/tickets/item"); }
}
