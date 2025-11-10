import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(process.cwd(), "memories-export.json");
const destDir = path.join(process.cwd(), "public");
const imagesDir = path.join(destDir, "images");
const outJson = path.join(destDir, "memories.json");

if (!fs.existsSync(src)) {
  console.error("Place the exported file at ./memories-export.json (use Export JSON in the app).");
  process.exit(1);
}

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const raw = fs.readFileSync(src, "utf8");
let list;
try {
  list = JSON.parse(raw);
} catch (e) {
  console.error("Invalid JSON in memories-export.json:", e.message);
  process.exit(1);
}

let written = 0;
for (const memory of list) {
  if (!Array.isArray(memory.images)) continue;
  const outImages = [];
  for (let i = 0; i < memory.images.length; i++) {
    const img = memory.images[i];
    if (typeof img !== "string") continue;

    if (img.startsWith("data:")) {
      const match = img.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      if (!match) continue;
      const mime = match[1];
      const b64 = match[2];
      const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      const id = memory.id || Date.now().toString();
      const filename = `${id}_${i}.${ext}`;
      const filepath = path.join(imagesDir, filename);
      const buffer = Buffer.from(b64, "base64");
      fs.writeFileSync(filepath, buffer);
      outImages.push(`images/${filename}`);
      written++;
    } else {
      // already a URL or path, keep it
      outImages.push(img);
    }
  }
  memory.images = outImages;
}

// write resulting JSON
fs.writeFileSync(outJson, JSON.stringify(list, null, 2), "utf8");
console.log(`Wrote ${outJson} and extracted ${written} images to public/images/. Commit public/ to publish.`);
