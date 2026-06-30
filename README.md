# Universal Skills

Kho lưu trữ **Agent Skills** đa nền tảng — cung cấp các kỹ năng (skills) đóng gói sẵn cho các tác nhân lập trình (coding agents) như Claude Code, OpenAI Codex và GitHub Copilot.

> Xem tài liệu kiến trúc chi tiết: [Universal_Skills_Architecture.md](Universal_Skills_Architecture.md)

---

## 📦 Cài đặt

### Bước 1: Clone repository

```bash
git clone https://github.com/chienthan2vn/universal-skills.git /tmp/skills --depth 1
```

### Bước 2: Copy skills cho coding agent của bạn

#### Claude Code

```bash
# Linux / macOS
cp -rf /tmp/skills/claude/skills/* .claude/skills/
```
```bash
# Windows
xcopy /tmp/skills\claude\skills .claude\skills\ /E /I /Y
```

#### OpenAI Codex

```bash
# Linux / macOS
cp -rf /tmp/skills/codex/skills/* .codex/skills/
```
```bash
# Windows
xcopy /tmp/skills\codex\skills .codex\skills\ /E /I /Y
```

#### GitHub Copilot

```bash
# Linux / macOS
cp -rf /tmp/skills/copilot/skills/* .agents/skills/
```
```bash
# Windows
xcopy /tmp/skills\copilot\skills .agents\skills\ /E /I /Y
```
