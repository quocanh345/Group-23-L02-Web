# CLAUDE.md

## Quy tắc quan trọng nhất

Đây là dự án học tập. Thành viên nhóm tự viết code. Claude chỉ được giải thích khái niệm, review code, chỉ ra lỗi, và gợi ý tên API/thư viện khi được hỏi. KHÔNG viết hoặc sửa code tính năng trừ khi thành viên yêu cầu rõ ràng cho đúng đoạn code đó.

## Dự án

Website ôn tập và thi thử trắc nghiệm tích hợp AI hỗ trợ sinh đề. Đồ án của nhóm 3 sinh viên. Lộ trình trong `ROADMAP.md`.

## Công nghệ

- Node.js 26 LTS (`.nvmrc`), npm.
- `backend/`: Express 5 + TypeScript, ES Modules (`"type": "module"`, import tương đối ghi đuôi `.js`). Dev bằng `tsx watch`, build bằng `tsc`. Code theo tính năng trong `src/modules/<tên>/`.
- Cơ sở dữ liệu: PostgreSQL 18 qua `docker-compose.yml`, Prisma ORM 7 (`backend/prisma/schema.prisma`, `backend/prisma7.config.ts`). Prisma Client sinh vào `backend/src/generated/prisma/` (không commit).
- `frontend/`: React 19 + Vite 8 + TypeScript.
- oxlint + Prettier dùng chung cấu hình (`.prettierrc.json` ở gốc).

## Cách chạy

```bash
npm install && npm install --prefix backend && npm install --prefix frontend
# tạo backend/.env và frontend/.env từ .env.example
npm run db:up                               # bật PostgreSQL
npm --prefix backend run prisma:migrate     # áp dụng migration
npm --prefix backend run prisma:generate    # sinh Prisma Client
npm run dev                                 # backend :3000, frontend :5173
```

Kiểm tra trước khi mở PR: `npm run lint` và `npm run build` trong `backend/` và `frontend/`.

## Quy ước

- Đọc `docs/database.md` trước khi làm việc liên quan đến database; cập nhật file này trong cùng PR nếu đổi bảng hoặc cột.
- Tuân thủ `CONTRIBUTING.md`. Không commit bí mật.
