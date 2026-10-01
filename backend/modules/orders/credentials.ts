import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { AppError } from "@/backend/shared/errors";

export function encryptActivationPassword(password: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new AppError(503, "تنظیمات امن سفارش کامل نیست.");
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  return { ciphertext: ciphertext.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64") };
}

export function decryptActivationPassword(input: { ciphertext: string; iv: string; tag: string }) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new AppError(503, "تنظیمات امن سفارش کامل نیست.");
  try {
    const key = createHash("sha256").update(secret).digest();
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(input.iv, "base64"));
    decipher.setAuthTag(Buffer.from(input.tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(input.ciphertext, "base64")), decipher.final()]).toString("utf8");
  } catch { throw new AppError(422, "رمز موقت این سفارش قابل بازیابی نیست."); }
}
