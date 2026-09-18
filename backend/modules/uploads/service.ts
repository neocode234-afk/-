import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { join } from "path";
import { AppError } from "@/backend/shared/errors";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const maxBytes = 8 * 1024 * 1024;
const maxPixels = 24_000_000;
function magic(bytes: Uint8Array, type: string) {
  return type === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 :
    type === "image/png" ? bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 :
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}
function pngPixels(bytes: Uint8Array) { return bytes.length >= 24 ? (bytes[16] * 2 ** 24 + bytes[17] * 2 ** 16 + bytes[18] * 256 + bytes[19]) * (bytes[20] * 2 ** 24 + bytes[21] * 2 ** 16 + bytes[22] * 256 + bytes[23]) : 0; }
export async function savePromptImage(file: File) {
  const ext = allowed.get(file.type);
  if (!ext || !file.size || file.size > maxBytes) throw new AppError(400, "فقط JPG، PNG یا WEBP تا ۸MB مجاز است.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!magic(bytes, file.type)) throw new AppError(400, "محتوای فایل تصویر معتبر نیست.");
  if (file.type === "image/png" && pngPixels(bytes) > maxPixels) throw new AppError(400, "ابعاد تصویر بیش از حد مجاز است.");
  const dir = join(process.cwd(), "public", "uploads", "prompts");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(join(dir, name), bytes, { flag: "wx" });
  return `/uploads/prompts/${name}`;
}
