import { NextResponse } from "next/server";
import { getSession } from "@/backend/modules/auth/session";
import { updateAccountOrder, type OrderStatus } from "@/backend/modules/orders/repository";
import { errorResponse, parseJson, AppError } from "@/backend/shared/errors";
import { logEvent } from "@/backend/shared/logger";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await parseJson(request);
    const status = body.status as OrderStatus;
    const note = typeof body.note === "string" ? body.note.slice(0, 500) : "";
    if (!["pending", "approved", "rejected"].includes(status)) throw new AppError(400, "وضعیت سفارش معتبر نیست.");
    const { id } = await params;
    if (!await updateAccountOrder(id, status, note, session.sub)) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
    logEvent("order.status_changed", { orderId: id, status, adminId: session.sub });
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error, "admin/orders/id"); }
}
