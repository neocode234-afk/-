import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const mysql = require("mysql2/promise");

for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const source = readFileSync(resolve("data/prompts.ts"), "utf8");
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = { exports: {} };
new Function("exports", "module", output)(module.exports, module);
const prompts = module.exports.prompts;

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

try {
  const [[{ total }]] = await connection.query("SELECT COUNT(*) AS total FROM prompts");
  if (total > 0) {
    console.log(`Skipped: ${total} prompt(s) already exist.`);
  } else {
    for (const prompt of prompts) {
      await connection.execute(
        "INSERT INTO prompts(title,slug,description,prompt_text,category,tags,image,status) VALUES(?,?,?,?,?,?,?, 'published')",
        [prompt.title, prompt.slug, prompt.description, prompt.prompt, prompt.category, JSON.stringify(prompt.tags), prompt.image],
      );
    }
    console.log(`Seeded ${prompts.length} prompt(s).`);
  }
} finally {
  await connection.end();
}
