import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db, hasDatabase } from "@/backend/shared/database";

export type OrderStatus = "pending" | "approved" | "rejected";
export interface AccountOrder extends RowDataPacket {
  id: string; user_id: string; user_name: string; user_phone: string; plan_slug: string; plan_title: string; amount: number; currency: "IRT";
  activation_email: string | null; contact_phone: string | null; reference: string; receipt_name: string; receipt_type: string; status: OrderStatus; admin_note: string | null;
  created_at: string; updated_at: string; reviewed_at: string | null;
}

function mapOrder(row: RowDataPacket): AccountOrder {
  return { ...row, id: String(row.id), user_id: String(row.user_id), amount: Number(row.amount), currency: "IRT", activation_email: row.activation_email ? String(row.activation_email) : null, contact_phone: row.contact_phone ? String(row.contact_phone) : null, created_at: new Date(row.created_at).toISOString(), updated_at: new Date(row.updated_at).toISOString(), reviewed_at: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : null } as AccountOrder;
}

type NewOrder = { userId: string; planSlug: string; planTitle: string; amount: number; activationEmail: string; contactPhone: string; passwordCiphertext: string; passwordIv: string; passwordTag: string; reference: string; receiptName: string; receiptType: string; receipt: Buffer };

export async function createAccountOrder(input: NewOrder) {
  const [result] = await db().execute<ResultSetHeader>("INSERT INTO account_orders(user_id,plan_slug,plan_title,amount,currency,activation_email,contact_phone,activation_password_ciphertext,activation_password_iv,activation_password_tag,reference,receipt_name,receipt_type,receipt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [input.userId, input.planSlug, input.planTitle, input.amount, "IRT", input.activationEmail, input.contactPhone, input.passwordCiphertext, input.passwordIv, input.passwordTag, input.reference, input.receiptName, input.receiptType, input.receipt]);
  return String(result.insertId);
}

export async function hasAccountOrderForUser(userId: string) {
  const [rows] = await db().execute<RowDataPacket[]>("SELECT 1 FROM account_orders WHERE user_id=? LIMIT 1", [userId]);
  return rows.length > 0;
}

const orderColumns = "o.id,o.user_id,u.name AS user_name,u.phone AS user_phone,o.plan_slug,o.plan_title,o.amount,o.currency,o.activation_email,o.contact_phone,o.reference,o.receipt_name,o.receipt_type,o.status,o.admin_note,o.created_at,o.updated_at,o.reviewed_at";

export async function getAccountOrders() {
  if (!hasDatabase()) return [] as AccountOrder[];
  try { const [rows] = await db().query<RowDataPacket[]>(`SELECT ${orderColumns} FROM account_orders o INNER JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`); return rows.map(mapOrder); }
  catch (error) { if ((error as { code?: string }).code === "ER_NO_SUCH_TABLE") return []; throw error; }
}

export async function getAccountOrdersByUserId(userId: string) {
  if (!hasDatabase()) return [] as AccountOrder[];
  try { const [rows] = await db().execute<RowDataPacket[]>(`SELECT ${orderColumns} FROM account_orders o INNER JOIN users u ON u.id=o.user_id WHERE o.user_id=? ORDER BY o.created_at DESC`, [userId]); return rows.map(mapOrder); }
  catch (error) { if ((error as { code?: string }).code === "ER_NO_SUCH_TABLE") return []; throw error; }
}

export async function updateAccountOrder(id: string, status: OrderStatus, adminNote: string, reviewerId: string) {
  const [result] = await db().execute<ResultSetHeader>("UPDATE account_orders SET status=?,admin_note=?,reviewed_at=NOW(),reviewed_by=? WHERE id=?", [status, adminNote || null, reviewerId, id]);
  return result.affectedRows === 1;
}

export async function getOrderReceipt(id: string) {
  const [rows] = await db().execute<RowDataPacket[]>("SELECT receipt,receipt_name,receipt_type FROM account_orders WHERE id=? LIMIT 1", [id]);
  return rows[0] ? { data: Buffer.from(rows[0].receipt), name: String(rows[0].receipt_name), type: String(rows[0].receipt_type) } : null;
}

export async function getOrderActivationCredentials(id: string) {
  const [rows] = await db().execute<RowDataPacket[]>("SELECT activation_email,contact_phone,activation_password_ciphertext,activation_password_iv,activation_password_tag FROM account_orders WHERE id=? LIMIT 1", [id]);
  const row = rows[0];
  if (!row) return null;
  return { email: row.activation_email ? String(row.activation_email) : null, phone: row.contact_phone ? String(row.contact_phone) : null, ciphertext: row.activation_password_ciphertext ? String(row.activation_password_ciphertext) : null, iv: row.activation_password_iv ? String(row.activation_password_iv) : null, tag: row.activation_password_tag ? String(row.activation_password_tag) : null };
}
