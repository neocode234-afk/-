import { NextResponse } from "next/server";
import { getPromptTextById } from "@/lib/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promptText = await getPromptTextById(id);

  if (!promptText) return NextResponse.json({ error: "پرامپت پیدا نشد." }, { status: 404 });
  return NextResponse.json({ prompt_text: promptText });
}
