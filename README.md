# Universal Skills

Kho lưu trữ **Agent Skills** đa nền tảng — cung cấp các kỹ năng (skills) đóng gói sẵn cho các tác nhân lập trình (coding agents) như Claude Code, OpenAI Codex và GitHub Copilot.

## 📦 Cài đặt

### Claude Code

```bash
npm install claude-agent-skills
```

Sau khi cài, thư mục `skills/` sẽ được copy vào `.claude/skills/` — Claude Code tự động phát hiện và load các skills từ đó.

### OpenAI Codex

```bash
npm install codex-agent-skills
```

→ Skills được copy vào `.codex/skills/`

### GitHub Copilot

```bash
npm install copilot-agent-skills
```

→ Skills được copy vào `.agents/skills/`

> **Yêu cầu:** Node.js >= 18

## 🗂 Cấu trúc repo

```
universal-skills/
├── claude/              # Skills cho Claude Code
│   ├── install.js
│   ├── package.json
│   └── skills/
│       ├── docx/        # Tạo/chỉnh sửa Word documents
│       ├── pdf/         # Xử lý PDF
│       ├── pptx/        # Tạo PowerPoint
│       ├── xlsx/        # Tạo Excel spreadsheets
│       ├── skill-creator/  # Meta-skill: tạo skill mới
│       └── ... (17+ skills)
├── codex/               # Skills cho OpenAI Codex
│   ├── install.js
│   ├── package.json
│   └── skills/
│       ├── cloudflare-deploy/
│       ├── codebase-knowledge/
│       └── ... 
├── copilot/             # Skills cho GitHub Copilot
│   ├── install.js
│   ├── package.json
│   └── skills/
│       ├── acquire-codebase-knowledge/
│       ├── acreadiness-assess/
│       └── ...
├── docs/                # GitHub Pages site
│   ├── index.html       # Catalog skills (tự động sinh)
│   └── .nojekyll
├── scripts/
│   ├── build-docs.js    # Script build catalog HTML
│   └── version-sync.js  # Đồng bộ version giữa các package
├── package.json
├── CLAUDE.md
└── README.md
```

## 🧠 Skills là gì?

Mỗi skill là một gói hướng dẫn đóng gói sẵn, giúp tác nhân AI thực hiện một tác vụ cụ thể hiệu quả hơn. Cấu trúc chuẩn:

```
skill-name/
├── SKILL.md          # Mô tả + hướng dẫn (YAML frontmatter + Markdown)
├── scripts/          # Scripts tự động hoá
├── references/       # Tài liệu tham khảo (load theo nhu cầu)
└── assets/           # Tài nguyên : templates, fonts, icons
```

Khi người dùng đưa ra yêu cầu, tác nhân AI sẽ tự động chọn skill phù hợp dựa trên mô tả (description) trong file `SKILL.md`, load hướng dẫn và thực hiện.

## 🔧 Phát triển

### Build GitHub Pages catalog

```bash
npm run docs:build
```

Quét tất cả `SKILL.md` từ cả 3 nền tảng, sinh file `docs/index.html`.

### Thêm skill mới

Tham khảo skill `skill-creator` trong `claude/skills/skill-creator/` cho quy trình đầy đủ: draft → test → đánh giá → cải thiện.

Quy tắc cơ bản:
- `SKILL.md` dưới 500 dòng
- Mô tả (`description`) là yếu tố quyết định skill có được chọn hay không — hãy mô tả cả **việc skill làm được** lẫn **khi nào nên dùng**
- Giải thích **tại sao** hơn là dùng mệnh lệnh ALL-CAPS
- Bundle scripts thay vì bắt AI viết lại mỗi lần

### Đồng bộ version

```bash
# Xem version hiện tại
node scripts/version-sync.js

# Set tất cả lên cùng một version
node scripts/version-sync.js 1.3.0

# Bump version
node scripts/version-sync.js --bump=patch
```

## 🌐 GitHub Pages

Catalog skills trực tuyến: **https://chienthan2vn.github.io/universal-skills/**

Hiển thị tất cả skills từ 3 nền tảng, filter theo platform, kèm install commands. Cập nhật bằng `npm run docs:build` và push `docs/` lên GitHub.

## 📜 Giấy phép

[MIT License](LICENSE)
