import type { RowDataPacket } from "mysql2";
import { db } from "@/backend/shared/database";
interface AdminRow extends RowDataPacket { id: number; email: string; password_hash: string }
export async function findAdminByEmail(email: string): Promise<AdminRow | null> {
  const [rows] = await db().execute<AdminRow[]>("SELECT id,email,password_hash FROM admins WHERE email=? LIMIT 1", [email]);
  return rows[0] ?? null;
}
