import { NextResponse } from "next/server";
import { getSession } from "@/backend/modules/auth/session";
import { getOrderReceipt } from "@/backend/modules/orders/repository";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const receipt = await getOrderReceipt(id);
  if (!receipt) return NextResponse.json({ error: "رسید پیدا نشد." }, { status: 404 });
  return new NextResponse(receipt.data, { headers: { "Content-Type": receipt.type, "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(receipt.name)}`, "Cache-Control": "private, no-store" } });
}
