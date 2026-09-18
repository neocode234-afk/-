import type {ResultSetHeader,RowDataPacket} from "mysql2";import {db,hasDatabase} from "@/backend/shared/database";import type {Prompt} from "@/lib/types";import {prompts as local} from "@/data/prompts";import type {PromptInput} from "./service";
const optimizedLocalImage = (imageUrl: string) => imageUrl.startsWith("/images/prompts/") && imageUrl.endsWith(".png") ? imageUrl.replace(/\.png$/, ".webp") : imageUrl;
const fallback=():Prompt[]=>local.map(({ id, slug, title, description, prompt, image, category, tags })=>({id:String(id),slug,title,description,prompt_text:prompt,image_url:optimizedLocalImage(image),category,tags,status:"published",created_at:new Date(0).toISOString(),updated_at:new Date(0).toISOString()}));
function toPrompt(row: RowDataPacket): Prompt {
  let tags: string[] = [];
  try { tags = Array.isArray(row.tags) ? row.tags : JSON.parse(String(row.tags)); } catch { console.warn("Invalid prompt tags", row.id); }
  return {...row,id:String(row.id),image_url:optimizedLocalImage(String(row.image_url)),tags} as Prompt;
}
export async function getPrompts(includeDrafts=false):Promise<Prompt[]>{if(!hasDatabase())return fallback();const where=includeDrafts?"":" WHERE status = 'published'";const [rows]=await db().query<RowDataPacket[]>(`SELECT id,title,slug,description,prompt_text,category,tags,image AS image_url,status,created_at,updated_at FROM prompts${where} ORDER BY created_at DESC`);return rows.map(toPrompt)}
export async function getPromptBySlug(slug:string):Promise<Prompt|null>{if(!hasDatabase())return fallback().find(p=>p.slug===slug)??null;const [rows]=await db().execute<RowDataPacket[]>("SELECT id,title,slug,description,prompt_text,category,tags,image AS image_url,status,created_at,updated_at FROM prompts WHERE slug=? AND status='published' LIMIT 1",[slug]);return rows[0]?toPrompt(rows[0]):null}
export async function getPromptTextById(id:string):Promise<string|null>{if(!hasDatabase())return fallback().find(p=>p.id===id)?.prompt_text??null;const [rows]=await db().execute<RowDataPacket[]>("SELECT prompt_text FROM prompts WHERE id=? AND status='published' LIMIT 1",[id]);return rows[0]?String(rows[0].prompt_text):null}
function values(p: PromptInput) {
  return [p.title, p.slug, p.description, p.prompt_text, p.category, JSON.stringify(p.tags), p.image_url, p.status];
}
export async function createPrompt(p: PromptInput) {
  const [result] = await db().execute<ResultSetHeader>("INSERT INTO prompts(title,slug,description,prompt_text,category,tags,image,status) VALUES(?,?,?,?,?,?,?,?)", values(p));
  return { id: String(result.insertId) };
}
export async function updatePrompt(id: string, p: PromptInput) {
  const [previous] = await db().execute<RowDataPacket[]>("SELECT image FROM prompts WHERE id=? LIMIT 1", [id]);
  if (!previous[0]) return null;
  const [result] = await db().execute<ResultSetHeader>("UPDATE prompts SET title=?,slug=?,description=?,prompt_text=?,category=?,tags=?,image=?,status=? WHERE id=?", [...values(p), id]);
  return result.affectedRows === 1 ? String(previous[0].image) : null;
}
export async function deletePrompt(id: string) {
  const [rows] = await db().execute<RowDataPacket[]>("SELECT image FROM prompts WHERE id=? LIMIT 1", [id]);
  if (!rows[0]) return null;
  const [result] = await db().execute<ResultSetHeader>("DELETE FROM prompts WHERE id=?", [id]);
  return result.affectedRows === 1 ? String(rows[0].image) : null;
}
