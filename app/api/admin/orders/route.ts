import { NextResponse } from "next/server";
import { getSession } from "@/backend/modules/auth/session";
import { getAccountOrders } from "@/backend/modules/orders/repository";
import { errorResponse } from "@/backend/shared/errors";

export async function GET() { try { if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json(await getAccountOrders()); } catch (error) { return errorResponse(error, "admin/orders/list"); } }
