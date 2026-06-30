import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'skills');
const DST = join(process.cwd(), '.agents', 'skills');

export function installSkills(targetDir) {
  const dst = targetDir ?? DST;
  if (!existsSync(SRC)) return 0;
  mkdirSync(dst, { recursive: true });
  let count = 0;
  for (const d of readdirSync(SRC)) {
    if (statSync(join(SRC, d)).isDirectory()) {
      cpSync(join(SRC, d), join(dst, d), { recursive: true, force: true });
      count++;
    }
  }
  return count;
}

// Run directly: node copilot/install.js
const count = installSkills();
console.log(`Installed ${count} skill(s) to ${DST}`);
