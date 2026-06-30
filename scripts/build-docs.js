#!/usr/bin/env node

// build-docs.js — Build GitHub Pages site from skill metadata
//
// Scans all skill SKILL.md files, extracts frontmatter,
// and generates docs/index.html — a browsable catalog for users to
// find and copy skills. Output to docs/ for GitHub Pages.
//
// Usage:
//   node scripts/build-docs.js

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS_DIR = join(ROOT, 'docs');

const PLATFORMS = [
  { dir: 'claude',  label: 'Claude Code', target: '.claude/skills', color: '#6F4E37' },
  { dir: 'codex',   label: 'OpenAI Codex', target: '.codex/skills', color: '#412991' },
  { dir: 'copilot', label: 'GitHub Copilot', target: '.agents/skills', color: '#1F6FEB' },
];

function parseFrontmatter(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const fm = {};
    const lines = match[1].split('\n');
    let currentKey = null;
    for (const line of lines) {
      const keyMatch = line.match(/^(\w+):\s*(.*)/);
      if (keyMatch) {
        currentKey = keyMatch[1];
        fm[currentKey] = keyMatch[2].replace(/^["']|["']$/g, '');
      } else if (currentKey && line.startsWith('  ')) {
        // multiline value (simple)
        fm[currentKey] += ' ' + line.trim();
      }
    }
    return fm;
  } catch { return {}; }
}

function scanSkills() {
  const allSkills = [];

  for (const platform of PLATFORMS) {
    const skillsDir = join(ROOT, platform.dir, 'skills');
    if (!existsSync(skillsDir)) continue;

    const entries = readdirSync(skillsDir);
    for (const entry of entries) {
      const skillPath = join(skillsDir, entry);
      if (!statSync(skillPath).isDirectory()) continue;

      const skillMd = join(skillPath, 'SKILL.md');
      if (!existsSync(skillMd)) continue;

      const fm = parseFrontmatter(skillMd);
      allSkills.push({
        name: fm.name || entry,
        description: fm.description || 'No description available.',
        license: fm.license || '',
        platform: platform.label,
        platformKey: platform.dir,
        target: platform.target,
        color: platform.color,
        install: `npm install ${platform.dir}-agent-skills`,
      });
    }
  }

  return allSkills;
}

function buildHTML(skills) {
  const platformGroups = {};
  for (const s of skills) {
    if (!platformGroups[s.platformKey]) platformGroups[s.platformKey] = { label: s.platform, color: s.color, target: s.target, skills: [] };
    platformGroups[s.platformKey].skills.push(s);
  }

  const skillCards = skills.map(s => `
    <div class="skill-card" data-platform="${s.platformKey}">
      <div class="platform-badge" style="background:${s.color}">${s.platform}</div>
      <h3>${s.name}</h3>
      <p>${s.description.substring(0, 140)}${s.description.length > 140 ? '…' : ''}</p>
      <div class="install-block">
        <span class="install-label">Target:</span>
        <code>${s.target}/${s.name}/</code>
      </div>
    </div>`).join('\n');

  // Get short git commit hash for version display
  let gitHash = '';
  try { gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8', cwd: ROOT }).trim(); } catch { gitHash = ''; }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Universal Skills — Agent Skills Catalog</title>
  <meta name="description" content="Browse and install Agent Skills for Claude Code, OpenAI Codex, and GitHub Copilot">
  <style>
    :root { --bg: #0d1117; --card: #161b22; --border: #30363d; --text: #e6edf3; --muted: #8b949e; --accent: #58a6ff; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; }
    .container { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
    header { text-align: center; padding: 3rem 0 2rem; }
    h1 { font-size: 2.5rem; font-weight: 600; margin-bottom: .5rem; }
    h1 span { background: linear-gradient(135deg, #6F4E37, #412991, #1F6FEB); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: var(--muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
    .install-hero { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; margin: 2rem 0; }
    .install-hero h2 { font-size: 1rem; margin-bottom: .75rem; color: var(--accent); }
    .install-hero code { display: block; padding: .75rem 1rem; background: #0d1117; border: 1px solid var(--border); border-radius: 6px; margin: .5rem 0; font-size: .9rem; }
    .install-hero .cmd { cursor: pointer; transition: .2s; }
    .install-hero .cmd:hover { border-color: var(--accent); }
    .filters { display: flex; gap: .5rem; margin: 1.5rem 0; flex-wrap: wrap; }
    .filter-btn { padding: .4rem 1rem; border: 1px solid var(--border); border-radius: 20px; background: transparent; color: var(--text); cursor: pointer; font-size: .85rem; transition: .2s; }
    .filter-btn:hover, .filter-btn.active { border-color: var(--accent); color: var(--accent); }
    .filter-btn[data-p="all"].active { background: var(--accent); color: #fff; border-color: var(--accent); }
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .skill-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; transition: .2s; }
    .skill-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .platform-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: .75rem; font-weight: 500; color: #fff; margin-bottom: .5rem; }
    .skill-card h3 { font-size: 1.1rem; margin-bottom: .4rem; color: #fff; }
    .skill-card p { font-size: .875rem; color: var(--muted); margin-bottom: .75rem; }
    .install-block { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
    .install-label { font-size: .75rem; color: var(--muted); }
    .install-block code { font-size: .8rem; background: #0d1117; padding: 2px 6px; border-radius: 4px; }
    .version-bar { display: flex; gap: 1.5rem; justify-content: center; margin: 1.5rem 0; font-size: .85rem; color: var(--muted); }
    .version-bar span { display: flex; align-items: center; gap: .4rem; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
    footer { text-align: center; padding: 2rem 0; color: var(--muted); font-size: .85rem; }
    @media (max-width: 600px) { h1 { font-size: 1.8rem; } .skills-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<div class="container">
  <header>
    <h1><span>Universal</span> Skills</h1>
    <p class="subtitle">Agentic coding skills for Claude Code, OpenAI Codex, and GitHub Copilot — one catalog, three platforms.</p>
  </header>

  <div class="version-bar">
    <span><span class="dot" style="background:#6F4E37"></span> Claude Code</span>
    <span><span class="dot" style="background:#412991"></span> Codex</span>
    <span><span class="dot" style="background:#1F6FEB"></span> Copilot</span>
    ${gitHash ? `<span style="color:var(--muted);font-size:0.8rem">commit ${gitHash}</span>` : ''}
  </div>

  <div class="install-hero">
    <h2>⚡ Quick Install</h2>
    <p style="font-size:.875rem;margin-bottom:.75rem;color:var(--muted)">Choose your platform and run in your project root:</p>
    <code class="cmd" onclick="navigator.clipboard.writeText(this.textContent)">npm install claude-agent-skills</code>
    <code class="cmd" onclick="navigator.clipboard.writeText(this.textContent)">npm install codex-agent-skills</code>
    <code class="cmd" onclick="navigator.clipboard.writeText(this.textContent)">npm install copilot-agent-skills</code>
  </div>

  <div class="filters">
    <button class="filter-btn active" data-p="all" onclick="filterSkills('all')">All</button>
    <button class="filter-btn" data-p="claude" onclick="filterSkills('claude')">Claude Code</button>
    <button class="filter-btn" data-p="codex" onclick="filterSkills('codex')">OpenAI Codex</button>
    <button class="filter-btn" data-p="copilot" onclick="filterSkills('copilot')">GitHub Copilot</button>
  </div>

  <div class="skills-grid" id="skillsGrid">
    ${skillCards}
  </div>

  <footer>
    Skills follow the <a href="https://agentskills.io" style="color:var(--accent)">Agent Skills Spec</a>.
    ${new Date().getFullYear()} — Universal Skills
  </footer>
</div>

<script>
function filterSkills(platform) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.p === platform));
  document.querySelectorAll('.skill-card').forEach(c => {
    c.style.display = (platform === 'all' || c.dataset.platform === platform) ? '' : 'none';
  });
}
</script>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const skills = scanSkills();
mkdirSync(DOCS_DIR, { recursive: true });
writeFileSync(join(DOCS_DIR, 'index.html'), buildHTML(skills), 'utf8');
console.log(`✓ Built docs/index.html — ${skills.length} skills from ${PLATFORMS.length} platforms`);