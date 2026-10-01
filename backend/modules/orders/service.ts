import { AppError } from "@/backend/shared/errors";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["application/pdf", "pdf"]]);
const maxBytes = 5 * 1024 * 1024;

function validMagic(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/webp") return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

export async function readReceipt(file: File) {
  const ext = allowed.get(file.type);
  if (!ext || !file.size || file.size > maxBytes) throw new AppError(400, "رسید باید JPG، PNG، WEBP یا PDF و حداکثر ۵ مگابایت باشد.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!validMagic(bytes, file.type)) throw new AppError(400, "فرمت فایل رسید معتبر نیست.");
  return { data: Buffer.from(bytes), originalName: file.name.slice(0, 180) || `receipt.${ext}`, type: file.type };
}
