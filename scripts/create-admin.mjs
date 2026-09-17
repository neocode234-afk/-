import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12) {
  throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD with at least 12 characters.");
}
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
const passwordHash = await bcrypt.hash(password, 12);
await connection.execute(
  "INSERT INTO admins(email,password_hash) VALUES(?,?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)",
  [email, passwordHash],
);
await connection.end();
console.log("Admin account created or updated.");
