import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("fresh schema and user repository agree on the name column", () => {
  const schema = read("database/schema.sql");
  const repository = read("backend/modules/users/repository.ts");
  assert.match(schema, /users[\s\S]*name VARCHAR\(100\) NOT NULL/);
  assert.match(repository, /INSERT INTO users\(name,phone,password_hash\)/);
});

test("existing databases have a migration for user names", () => {
  const migration = read("database/migrations/001_add_user_name.sql");
  assert.match(migration, /ALTER TABLE users ADD COLUMN IF NOT EXISTS name/i);
});

test("the registration UI no longer redirects users to a missing account page", () => {
  const accessPanel = read("components/AccessPanel.tsx");
  assert.doesNotMatch(accessPanel, /router\.replace\(data\.admin\?"\/admin":"\/account"\)/);
});

test("prompt mutations verify affected database rows", () => {
  const repository = read("backend/modules/prompts/repository.ts");
  assert.match(repository, /affectedRows === 1/);
  assert.match(repository, /SELECT image FROM prompts WHERE id=\?/);
});
