# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

**Universal Skills** is a multi-platform Agent Skills distribution repository. Each platform lives in its own subdirectory with an independent git repo:

| Directory | Target Dir | Git Remote |
|-----------|-----------|------------|
| `claude/` | `.claude/skills/` | https://github.com/anthropics/skills.git |
| `codex/` | `.codex/skills/` | https://github.com/openai/skills.git |
| `copilot/` | `.agents/skills/` | (standalone) |

Users install skills by cloning this repo (or a platform-specific fork) directly into their agent's skill directory.

## Install Commands

```bash
# Bước 1: Clone repo vào thư mục tạm
git clone https://github.com/chienthan2vn/universal-skills.git /tmp/skills --depth 1

# Bước 2: Copy skills của nền tảng bạn dùng
# Claude Code
cp -rf /tmp/skills/claude/skills/* .claude/skills/          # Linux/macOS
xcopy /tmp/skills\claude\skills .claude\skills\ /E /I /Y    # Windows

# OpenAI Codex
cp -rf /tmp/skills/codex/skills/* .codex/skills/            # Linux/macOS
xcopy /tmp/skills\codex\skills .codex\skills\ /E /I /Y      # Windows

# GitHub Copilot
cp -rf /tmp/skills/copilot/skills/* .agents/skills/         # Linux/macOS
xcopy /tmp/skills\copilot\skills .agents\skills\ /E /I /Y   # Windows
```

## Development Commands

```bash
npm run docs:build   # build index.html catalog page
```

## Skill Structure

All skills follow the **Agent Skills Spec (agentskills.io)** core: a `SKILL.md` with YAML frontmatter (`name`, `description` required) plus Markdown body. Each platform extends this differently:

### Claude Code (`claude/skills/<name>/`)
Extended YAML frontmatter with `context` (fork), `agent`, `model`, `effort`, `arguments`, `paths`, `shell`, `disable-model-invocation`, `user-invocable`.
- `SKILL.md` — required
- `template.md` / `examples/` / `scripts/` / `reference.md`

### Codex (`codex/skills/<name>/`)
- `SKILL.md` — standard YAML frontmatter
- `agents/openai.yaml` — UI config (`interface.display_name`, `interface.short_description`, `interface.default_prompt`)
- `references/` / `scripts/` / `assets/`

### Copilot (`copilot/skills/<name>/`)
Pure Agent Skills Spec. Uses `compatibility`, `metadata`, `license`, `allowed-tools` fields.
- `SKILL.md` / `scripts/` / `references/` / `assets/`

## Progressive Disclosure

Skills load in three tiers to conserve tokens:
1. **Metadata** (name + description from YAML frontmatter) — always in context
2. **SKILL.md body** — loaded when description matches user intent
3. **Bundled resources** (scripts/, references/, assets/) — loaded on demand

The `description` field is the critical trigger — describe both *what* the skill does and *when* to use it.

## Git Operations

Each platform subdirectory is an independent git repo:

```bash
git -C claude/ status
git -C claude/ add claude/skills/<skill-name>/
git -C claude/ commit -m "..."
git -C claude/ push origin main
```

## Creating a New Skill

See `claude/skills/skill-creator/` for the full iterative workflow (draft → test → evaluate → iterate). Key guidelines:
- Keep `SKILL.md` under 500 lines; use reference files for deeper content
- Explain *why* rather than using ALL-CAPS MUST constraints
- Bundle reusable scripts in `scripts/` instead of regenerating them each invocation
- For multi-framework skills, organize references by domain variant
- Run `npm run docs:build` after adding a new skill to update the catalog
