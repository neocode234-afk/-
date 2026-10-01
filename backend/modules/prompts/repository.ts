import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db, hasDatabase } from "@/backend/shared/database";
import type { Prompt } from "@/lib/types";
import { prompts as local } from "@/data/prompts";
import type { PromptInput } from "./service";
import { logEvent } from "@/backend/shared/logger";

const optimizedLocalImage = (imageUrl: string) => imageUrl.startsWith("/images/prompts/") && imageUrl.endsWith(".png") ? imageUrl.replace(/\.png$/, ".webp") : imageUrl;
const promptColumns = "p.id,p.title,p.slug,p.description,p.prompt_text,p.category,p.tags,p.image AS image_url,p.status,p.created_at,p.updated_at,COALESCE(ROUND(AVG(pr.rating),1),0) AS rating_average,COUNT(pr.id) AS rating_count";
const ratingJoin = " LEFT JOIN prompt_ratings pr ON pr.prompt_id=p.id";
const ratingGroup = " GROUP BY p.id";

const fallback = (): Prompt[] => local.map(({ id, slug, title, description, prompt, image, category, tags }) => ({ id: String(id), slug, title, description, prompt_text: prompt, image_url: optimizedLocalImage(image), category, tags, status: "published", created_at: new Date(0).toISOString(), updated_at: new Date(0).toISOString(), rating_average: 0, rating_count: 0 }));

function toPrompt(row: RowDataPacket): Prompt {
  let tags: string[] = [];
  try { tags = Array.isArray(row.tags) ? row.tags : JSON.parse(String(row.tags)); } catch { logEvent("prompt.invalid_tags", { promptId: String(row.id) }); }
  return { ...row, id: String(row.id), image_url: optimizedLocalImage(String(row.image_url)), tags, rating_average: Number(row.rating_average || 0), rating_count: Number(row.rating_count || 0) } as Prompt;
}

export async function getPrompts(includeDrafts = false): Promise<Prompt[]> {
  if (!hasDatabase()) return fallback();
  const where = includeDrafts ? "" : " WHERE p.status = 'published'";
  const [rows] = await db().query<RowDataPacket[]>(`SELECT ${promptColumns} FROM prompts p${ratingJoin}${where}${ratingGroup} ORDER BY p.created_at DESC`);
  return rows.map(toPrompt);
}

export async function getPromptBySlug(slug: string): Promise<Prompt | null> {
  if (!hasDatabase()) return fallback().find((prompt) => prompt.slug === slug) ?? null;
  const [rows] = await db().execute<RowDataPacket[]>(`SELECT ${promptColumns} FROM prompts p${ratingJoin} WHERE p.slug=? AND p.status='published'${ratingGroup} LIMIT 1`, [slug]);
  return rows[0] ? toPrompt(rows[0]) : null;
}

export async function getPromptTextById(id: string): Promise<string | null> {
  if (!hasDatabase()) return fallback().find((prompt) => prompt.id === id)?.prompt_text ?? null;
  const [rows] = await db().execute<RowDataPacket[]>("SELECT prompt_text FROM prompts WHERE id=? AND status='published' LIMIT 1", [id]);
  return rows[0] ? String(rows[0].prompt_text) : null;
}

export async function ratePrompt(id: string, userId: number, rating: number) {
  const [prompt] = await db().execute<RowDataPacket[]>("SELECT id FROM prompts WHERE id=? AND status='published' LIMIT 1", [id]);
  if (!prompt[0]) return null;
  await db().execute("INSERT INTO prompt_ratings(prompt_id,user_id,rating) VALUES(?,?,?) ON DUPLICATE KEY UPDATE rating=VALUES(rating),updated_at=CURRENT_TIMESTAMP", [id, userId, rating]);
  const [rows] = await db().execute<RowDataPacket[]>("SELECT COALESCE(ROUND(AVG(rating),1),0) AS rating_average,COUNT(*) AS rating_count FROM prompt_ratings WHERE prompt_id=?", [id]);
  return { rating_average: Number(rows[0]?.rating_average || 0), rating_count: Number(rows[0]?.rating_count || 0), rating };
}

function values(prompt: PromptInput) { return [prompt.title, prompt.slug, prompt.description, prompt.prompt_text, prompt.category, JSON.stringify(prompt.tags), prompt.image_url, prompt.status]; }

export async function createPrompt(prompt: PromptInput) {
  const [result] = await db().execute<ResultSetHeader>("INSERT INTO prompts(title,slug,description,prompt_text,category,tags,image,status) VALUES(?,?,?,?,?,?,?,?)", values(prompt));
  return { id: String(result.insertId) };
}

export async function updatePrompt(id: string, prompt: PromptInput) {
  const [previous] = await db().execute<RowDataPacket[]>("SELECT image FROM prompts WHERE id=? LIMIT 1", [id]);
  if (!previous[0]) return null;
  const [result] = await db().execute<ResultSetHeader>("UPDATE prompts SET title=?,slug=?,description=?,prompt_text=?,category=?,tags=?,image=?,status=? WHERE id=?", [...values(prompt), id]);
  return result.affectedRows === 1 ? String(previous[0].image) : null;
}

export async function deletePrompt(id: string) {
  const [rows] = await db().execute<RowDataPacket[]>("SELECT image FROM prompts WHERE id=? LIMIT 1", [id]);
  if (!rows[0]) return null;
  const [result] = await db().execute<ResultSetHeader>("DELETE FROM prompts WHERE id=?", [id]);
  return result.affectedRows === 1 ? String(rows[0].image) : null;
}
