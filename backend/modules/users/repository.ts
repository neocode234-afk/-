import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/backend/shared/database";

export interface UserRow extends RowDataPacket { id: number; name: string; phone: string; password_hash: string; }
export type AdminUser = { id: string; name: string; phone: string; created_at: string; order_count: number; rating_count: number; last_order_at: string | null };
export async function createUser(name: string, phone: string, passwordHash: string) {
  const [result] = await db().execute<ResultSetHeader>("INSERT INTO users(name,phone,password_hash) VALUES(?,?,?)", [name, phone, passwordHash]);
  return Number(result.insertId);
}

export async function findUserByPhone(phone: string) {
  const [rows] = await db().execute<UserRow[]>("SELECT id,name,phone,password_hash FROM users WHERE phone=? LIMIT 1", [phone]);
  return rows[0] ?? null;
}

export async function getUsersForAdmin(): Promise<AdminUser[]> {
  const [rows] = await db().query<RowDataPacket[]>("SELECT u.id,u.name,u.phone,u.created_at,COUNT(DISTINCT o.id) AS order_count,COUNT(DISTINCT pr.id) AS rating_count,MAX(o.created_at) AS last_order_at FROM users u LEFT JOIN account_orders o ON o.user_id=u.id LEFT JOIN prompt_ratings pr ON pr.user_id=u.id GROUP BY u.id ORDER BY u.created_at DESC");
  return rows.map((row) => ({ id: String(row.id), name: String(row.name), phone: String(row.phone), created_at: new Date(row.created_at).toISOString(), order_count: Number(row.order_count || 0), rating_count: Number(row.rating_count || 0), last_order_at: row.last_order_at ? new Date(row.last_order_at).toISOString() : null }));
}
