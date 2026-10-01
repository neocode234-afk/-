import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/backend/shared/database";

export const ticketStatuses = ["open", "in_progress", "waiting_for_user", "answered", "closed"] as const;
export const ticketPriorities = ["low", "normal", "high", "urgent"] as const;
export type TicketStatus = typeof ticketStatuses[number];
export type TicketPriority = typeof ticketPriorities[number];
export type Ticket = { id: string; ticket_number: string; user_id: string; user_name: string; user_phone: string; subject: string; category: string; status: TicketStatus; priority: TicketPriority; created_at: string; updated_at: string; last_message_at: string; closed_at: string | null; unread_for_admin: number; unread_for_user: number };
export type TicketMessage = { id: string; sender_type: "USER" | "ADMIN"; message: string; created_at: string; read_at: string | null };

const columns = "t.id,t.ticket_number,t.user_id,u.name AS user_name,u.phone AS user_phone,t.subject,t.category,t.status,t.priority,t.created_at,t.updated_at,t.last_message_at,t.closed_at,(SELECT COUNT(*) FROM ticket_messages ma WHERE ma.ticket_id=t.id AND ma.sender_type='USER' AND ma.read_at IS NULL) AS unread_for_admin,(SELECT COUNT(*) FROM ticket_messages mu WHERE mu.ticket_id=t.id AND mu.sender_type='ADMIN' AND mu.read_at IS NULL) AS unread_for_user";
const mapTicket = (row: RowDataPacket): Ticket => ({ ...row, id: String(row.id), user_id: String(row.user_id), created_at: new Date(row.created_at).toISOString(), updated_at: new Date(row.updated_at).toISOString(), last_message_at: new Date(row.last_message_at).toISOString(), closed_at: row.closed_at ? new Date(row.closed_at).toISOString() : null, unread_for_admin: Number(row.unread_for_admin || 0), unread_for_user: Number(row.unread_for_user || 0) } as Ticket);
const mapMessage = (row: RowDataPacket): TicketMessage => ({ id: String(row.id), sender_type: row.sender_type, message: String(row.message), created_at: new Date(row.created_at).toISOString(), read_at: row.read_at ? new Date(row.read_at).toISOString() : null });

export async function getTicketsForAdmin() { const [rows] = await db().query<RowDataPacket[]>(`SELECT ${columns} FROM tickets t JOIN users u ON u.id=t.user_id ORDER BY t.last_message_at DESC`); return rows.map(mapTicket); }
export async function getTicketsForUser(userId: number) { const [rows] = await db().execute<RowDataPacket[]>(`SELECT ${columns} FROM tickets t JOIN users u ON u.id=t.user_id WHERE t.user_id=? ORDER BY t.last_message_at DESC`, [userId]); return rows.map(mapTicket); }
export async function getTicket(ticketNumber: string, userId?: number) { const scope = userId ? " AND t.user_id=?" : ""; const args = userId ? [ticketNumber, userId] : [ticketNumber]; const [rows] = await db().execute<RowDataPacket[]>(`SELECT ${columns} FROM tickets t JOIN users u ON u.id=t.user_id WHERE t.ticket_number=?${scope} LIMIT 1`, args); return rows[0] ? mapTicket(rows[0]) : null; }
export async function getMessages(ticketId: string) { const [rows] = await db().execute<RowDataPacket[]>("SELECT id,sender_type,message,created_at,read_at FROM ticket_messages WHERE ticket_id=? ORDER BY created_at ASC,id ASC", [ticketId]); return rows.map(mapMessage); }

export async function createTicket(userId: number, subject: string, category: string, message: string) {
  const connection = await db().getConnection();
  try { await connection.beginTransaction(); let ticketNumber = ""; let ticketId = 0; for (let attempt = 0; attempt < 4; attempt += 1) { ticketNumber = `AP-${Math.floor(100000 + Math.random() * 900000)}`; try { const [result] = await connection.execute<ResultSetHeader>("INSERT INTO tickets(ticket_number,user_id,subject,category) VALUES(?,?,?,?)", [ticketNumber, userId, subject, category]); ticketId = Number(result.insertId); break; } catch (error) { if ((error as { code?: string }).code !== "ER_DUP_ENTRY") throw error; } } if (!ticketId) throw new Error("Ticket number generation failed"); await connection.execute("INSERT INTO ticket_messages(ticket_id,sender_type,message) VALUES(?,'USER',?)", [ticketId, message]); await connection.commit(); return ticketNumber; } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function addTicketMessage(ticket: Ticket, sender: "USER" | "ADMIN", message: string) { await db().execute("INSERT INTO ticket_messages(ticket_id,sender_type,message) VALUES(?,?,?)", [ticket.id, sender, message]); const status: TicketStatus = sender === "ADMIN" ? "answered" : "in_progress"; await db().execute("UPDATE tickets SET status=?,last_message_at=CURRENT_TIMESTAMP,closed_at=NULL WHERE id=?", [status, ticket.id]); }
export async function markRead(ticketId: string, reader: "USER" | "ADMIN") { const sender = reader === "USER" ? "ADMIN" : "USER"; await db().execute("UPDATE ticket_messages SET read_at=CURRENT_TIMESTAMP WHERE ticket_id=? AND sender_type=? AND read_at IS NULL", [ticketId, sender]); }
export async function updateTicket(ticket: Ticket, status: TicketStatus, priority: TicketPriority) { await db().execute("UPDATE tickets SET status=?,priority=?,closed_at=CASE WHEN ?='closed' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id=?", [status, priority, status, ticket.id]); }
export async function getTicketSummary() { const [rows] = await db().query<RowDataPacket[]>("SELECT status,COUNT(*) AS count FROM tickets GROUP BY status"); return Object.fromEntries(rows.map((row) => [String(row.status), Number(row.count)])); }
