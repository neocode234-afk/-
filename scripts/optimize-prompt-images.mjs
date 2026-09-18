import { readdir } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const directory = join(process.cwd(), "public", "images", "prompts");
for (const file of await readdir(directory)) {
  if (!file.endsWith(".png")) continue;
  const output = join(directory, `${parse(file).name}.webp`);
  await sharp(join(directory, file))
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 76, effort: 5 })
    .toFile(output);
  console.log(output);
}
