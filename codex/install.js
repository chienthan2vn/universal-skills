import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'skills');
const DST = join(process.cwd(), '.codex', 'skills');

if (!existsSync(SRC)) process.exit(0);
mkdirSync(DST, { recursive: true });

for (const d of readdirSync(SRC)) {
  if (statSync(join(SRC, d)).isDirectory()) {
    cpSync(join(SRC, d), join(DST, d), { recursive: true, force: true });
  }
}
