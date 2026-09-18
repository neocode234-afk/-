import type { z } from "zod";
import { AppError } from "@/backend/shared/errors";
import { promptSchema } from "./schema";
import { createPrompt, deletePrompt, updatePrompt } from "./repository";

export type PromptInput = z.infer<typeof promptSchema>;
export async function createPromptService(input: PromptInput) {
  try { return await createPrompt(input); }
  catch (error: unknown) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") throw new AppError(409, "این Slug قبلاً استفاده شده است.");
    throw error;
  }
}
export async function updatePromptService(id: string, input: PromptInput) {
  if (!/^\d+$/.test(id)) throw new AppError(400, "شناسه پرامپت معتبر نیست.");
  const previousImage = await updatePrompt(id, input);
  if (previousImage === null) throw new AppError(404, "پرامپت موردنظر پیدا نشد.");
  return previousImage;
}
export async function deletePromptService(id: string) {
  if (!/^\d+$/.test(id)) throw new AppError(400, "شناسه پرامپت معتبر نیست.");
  const deleted = await deletePrompt(id);
  if (!deleted) throw new AppError(404, "پرامپت موردنظر پیدا نشد.");
  return deleted;
}
