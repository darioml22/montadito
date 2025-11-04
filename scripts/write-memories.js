import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(process.cwd(), 'memories-export.json');
const destDir = path.join(process.cwd(), 'public');
const dest = path.join(destDir, 'memories.json');

if (!fs.existsSync(src)) {
  console.error('Place the exported file at ./memories-export.json (use Export JSON in the app).');
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const data = fs.readFileSync(src, 'utf8');

try {
  JSON.parse(data);
  fs.writeFileSync(dest, data, 'utf8');
  console.log('Wrote public/memories.json. Now git add, commit and push to publish on GH Pages.');
} catch (e) {
  console.error('Invalid JSON in memories-export.json:', e.message);
  process.exit(1);
}
