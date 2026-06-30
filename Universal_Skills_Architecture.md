# TÀI LIỆU ĐẶC TẢ KIẾN TRÚC UNIVERSAL SKILLS 
**Dành cho Claude Code, OpenAI Codex & GitHub Copilot**

## 1. Tổng quan Kiến trúc Repository & Cấu trúc Skill

Kiến trúc `universal-skills` được thiết kế để quản lý và phân phối các Agent Skills cho ba nền tảng AI riêng biệt từ cùng một repository duy nhất. Trong mỗi nền tảng, thư mục `skills/` sẽ chứa các skill được định dạng sao cho vừa tương thích với chuẩn chung của Agent Skills Spec, vừa đáp ứng tính năng mở rộng của từng công cụ.

### Lý do lựa chọn kiến trúc này
1. **Cô lập đặc tả (Isolation of Specs):** Mặc dù dùng chung chuẩn cốt lõi (Agent Skills Spec), nhưng mỗi AI lại có các file config và frontmatter riêng (VD: `agents/openai.yaml` của Codex hay tính năng Dynamic Injection của Claude). Việc chia nhánh `claude/`, `codex/`, và `copilot/` ở thư mục gốc giúp các platform không bị nhầm lẫn và xung đột khi parse file.
2. **Độc lập trong phân phối (Independent Publishing):** Mỗi nền tảng có một hệ thống registry và phương thức cài đặt riêng (VD: Claude dùng command `/plugin`, Codex dùng `$skill-installer`). Với `package.json` nằm riêng trong từng thư mục nền tảng, CI/CD dễ dàng đóng gói và release thành 3 package độc lập (VD: `@your-org/skills-claude`, `@your-org/skills-codex`).
3. **Tiến trình phát triển linh hoạt:** Các lập trình viên có thể tùy biến sâu (ví dụ tạo thêm subagent cho Claude) mà không lo làm hỏng hay làm phình to kích thước của skill trên các nền tảng nhẹ hơn như Copilot.

```text
universal-skills/
│
├── codex/                          # Dành cho OpenAI Codex (GPT Plus)
│   ├── package.json
│   └── skills/
│       └── <skill-name>/           # Cấu trúc của 1 skill cho Codex
│           ├── SKILL.md            # [Bắt buộc] Name, description & hướng dẫn Markdown
│           ├── agents/             # [Đặc thù Codex]
│           │   └── openai.yaml     # Cấu hình UI, policy & dependencies (MCP servers)
│           ├── scripts/            # [Tùy chọn] Các mã thực thi tự động (Bash, Python)
│           ├── references/         # [Tùy chọn] Tài liệu tham khảo sâu
│           └── assets/             # [Tùy chọn] Templates, resources
│
├── claude/                         # Dành cho Claude Code
│   ├── package.json
│   └── skills/
│       └── <skill-name>/           # Cấu trúc của 1 skill cho Claude Code
│           ├── SKILL.md            # [Bắt buộc] YAML mở rộng cực mạnh (fork, path, shell...)
│           ├── template.md         # [Tùy chọn] Template riêng cho Claude điền vào
│           ├── examples/           # [Tùy chọn] Các ví dụ về sample output định hướng Claude
│           ├── scripts/            # [Tùy chọn] Scripts hỗ trợ
│           └── reference.md        # [Tùy chọn] Tài liệu API, Docs chi tiết
│
├── copilot/                        # Dành cho GitHub Copilot
│   ├── package.json
│   └── skills/
│       └── <skill-name>/           # Cấu trúc của 1 skill cho Copilot
│           ├── SKILL.md            # [Bắt buộc] Bám sát Agent Skills Spec thuần túy
│           ├── scripts/            # [Tùy chọn] Script thực thi
│           ├── references/         # [Tùy chọn] Tài liệu tham khảo
│           └── assets/             # [Tùy chọn] Tài nguyên tĩnh
│
├── .github/workflows/
│   └── release.yml                 # CI/CD tự động đóng gói và publish cho 3 nền tảng
│
└── README.md                       # Tài liệu hướng dẫn sử dụng chung
```

**Cơ chế hoạt động chung (Progressive Disclosure):**
Các nền tảng AI sẽ không tải toàn bộ nội dung của thư mục skill ngay từ đầu để tiết kiệm token/context window. Ban đầu, chúng chỉ quét lấy metadata (`name` và `description`) trong `SKILL.md`. Chỉ khi ngữ cảnh giao tiếp của người dùng phù hợp với description, toàn bộ nội dung `SKILL.md` mới được nạp. Sau đó, dựa trên hướng dẫn trong markdown, AI mới chủ động đọc tiếp các file bổ trợ trong `references/`, `examples/` hoặc chạy script nếu cần.

## 2. Giới thiệu Các Trường Thông Tin (Frontmatter Specification)

Mỗi nền tảng đều sử dụng chuẩn **Agent Skills Spec (agentskills.io)** làm lõi, nhưng có các phần mở rộng riêng. Dưới đây là quy chuẩn các trường thông tin trong file `SKILL.md` (YAML frontmatter):

### A. Copilot và Codex
- `name` *(Bắt buộc)*: Tên skill (chữ thường, số, dấu gạch ngang, max 64 ký tự). Phải khớp với tên thư mục.
- `description` *(Bắt buộc)*: Mô tả chi tiết chức năng và điều kiện kích hoạt (khi nào AI nên gọi skill này).
- `license` *(Tùy chọn)*: Tên giấy phép (VD: MIT, Apache-2.0).
- `compatibility` *(Tùy chọn)*: Yêu cầu môi trường (VD: Requires Node.js 18+).
- `metadata` *(Tùy chọn)*: Các cặp key-value tự do (author, version...).
- `allowed-tools` *(Tùy chọn)*: Khai báo trước các công cụ AI được phép dùng (VD: `Bash(git:*)`).

### B. Claude Code
Bao gồm các trường chuẩn chung và bổ sung thêm:
- `disable-model-invocation`: Đặt `true` để ngăn Claude tự động gọi (chỉ user được gọi qua `/skill-name`).
- `user-invocable`: Đặt `false` để ẩn skill khỏi menu của user (dành cho skill chạy ngầm).
- `context`: Đặt `fork` để chạy skill trong một subagent (tiến trình con) hoàn toàn độc lập.
- `agent`: Xác định loại subagent sẽ chạy (VD: `Explore`, `Plan`).
- `model` / `effort`: Ghi đè model (VD: `sonnet`) và mức độ suy luận (VD: `high`, `max`).
- `arguments` / `argument-hint`: Định nghĩa tham số truyền vào từ lệnh (VD: `$0`, `$1`).
- `paths`: Giới hạn skill chỉ kích hoạt khi user đang làm việc với các file cụ thể (VD: `*.ts, *.tsx`).
- `shell`: Xác định shell để chạy Dynamic Injection (mặc định `bash`, có thể đổi thành `powershell`).

## 3. Người dùng bổ sung — qua GitHub

Người dùng đóng góp skill mới hoặc cập nhật skill hiện có thông qua quy trình GitHub chuẩn:

### Fork & Pull Request

1. **Fork** repository về tài khoản GitHub cá nhân
2. **Clone** fork về máy:
   ```bash
   git clone https://github.com/<username>/universal-skills.git
   ```
3. **Tạo nhánh** cho thay đổi:
   ```bash
   git checkout -b feat/add-<skill-name>
   ```
4. **Thêm skill** vào đúng thư mục nền tảng (`claude/skills/`, `codex/skills/`, hoặc `copilot/skills/`)
5. **Commit** và push lên fork:
   ```bash
   git add claude/skills/<skill-name>/
   git commit -m "feat: add <skill-name> skill for Claude Code"
   git push origin feat/add-<skill-name>
   ```
6. **Mở Pull Request** từ fork về repository gốc

### Yêu cầu khi đóng góp
- Mỗi skill phải có file `SKILL.md` với frontmatter đầy đủ (`name`, `description`)
- Mô tả phải rõ ràng về chức năng và điều kiện kích hoạt
- Nếu skill đi kèm script, phải có hướng dẫn sử dụng

### Cập nhật skill
- Sửa đổi nội dung trong thư mục skill
- Commit với message mô tả thay đổi
- Mở PR nếu cần đồng bộ lên repository chính

## 4. Phiên bản — qua Git commit

### Cách thức hoạt động

- Mỗi commit là một mốc phiên bản (version) cho toàn bộ repository
