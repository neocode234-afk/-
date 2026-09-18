import type { ResultSetHeader } from "mysql2";
import { db } from "@/backend/shared/database";
export async function createUser(name: string, phone: string, passwordHash: string) {
  await db().execute<ResultSetHeader>("INSERT INTO users(name,phone,password_hash) VALUES(?,?,?)", [name, phone, passwordHash]);
}
