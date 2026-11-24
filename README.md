# Website ôn tập và thi thử trắc nghiệm tích hợp AI

Đồ án nhóm 23: website giúp người học ôn tập và thi thử trắc nghiệm, có AI hỗ trợ sinh đề từ tài liệu và từ các câu đã làm sai.

Tài liệu liên quan:

- [CONTRIBUTING.md](CONTRIBUTING.md): quy ước nhánh, commit, PR. **Đọc trước khi code.**
- [ROADMAP.md](ROADMAP.md): lộ trình và mốc theo tuần.
- [docs/database.md](docs/database.md): thiết kế cơ sở dữ liệu.
- [docs/api.md](docs/api.md): hợp đồng API, mỗi endpoint nhận gì và trả gì.
- [docs/api_convention.md](docs/api_convention.md): quy ước chung khi viết API (định dạng response, mã lỗi, bảo mật).

## Công nghệ

| Phần          | Công nghệ                                                     |
| ------------- | ------------------------------------------------------------- |
| Môi trường    | Node.js 26 LTS (ghi trong `.nvmrc`), npm                      |
| Backend       | Express 5 + TypeScript, chạy dev bằng `tsx`, build bằng `tsc` |
| Cơ sở dữ liệu | PostgreSQL 18 (chạy bằng Docker), Prisma ORM 7                |
| Frontend      | React 19 + Vite 8 + TypeScript                                |
| Kiểm tra code | oxlint (lint) + Prettier (định dạng), dùng chung cấu hình     |

## Cấu trúc thư mục

```
backend/
  prisma/schema.prisma   khai báo model cho Prisma
  prisma7.config.ts      cấu hình Prisma CLI (do prisma init sinh ra)
  src/server.ts          điểm khởi động Express
  src/modules/           mỗi tính năng một thư mục: auth, subjects, questions, ...
frontend/                ứng dụng React (template Vite)
docs/                    tài liệu thiết kế
docker-compose.yml       PostgreSQL cho môi trường dev
package.json             script tiện dụng chạy từ thư mục gốc
```

Backend dùng ES Modules (`"type": "module"`). Khi import một file `.ts` khác trong `src/`, ghi đuôi `.js`, ví dụ `import x from './duong-dan/ten-file.js'`.

## 1. Cài đặt trước

- **Node.js 26 LTS.** Tải ở [nodejs.org](https://nodejs.org). Nếu dùng nvm: `nvm install` rồi `nvm use` (nvm-windows: `nvm install 26` rồi `nvm use 26`). Kiểm tra bằng `node -v`.
- **Git.**
- **Docker Desktop.** Dùng để chạy PostgreSQL, không cần cài PostgreSQL vào máy. Mở Docker Desktop trước khi chạy các lệnh database.

**Không dùng được Docker?** Có thể cài PostgreSQL 18 trực tiếp từ [postgresql.org](https://www.postgresql.org/download/). Sau khi cài:

1. Tạo một database tên `quiz_app` (bằng pgAdmin hoặc `psql`).
2. Sửa `DATABASE_URL` trong `backend/.env` cho đúng user, mật khẩu và cổng trên máy mình.
3. Bỏ qua các lệnh `npm run db:up` / `npm run db:down` bên dưới.

## 2. Từ clone đến chạy được

```bash
# Lấy code về
git clone https://github.com/quocanh345/Group-23-L02-Web.git
cd Group-23-L02-Web

# Cài thư viện cho cả 3 nơi: gốc, backend, frontend
npm install
npm install --prefix backend
npm install --prefix frontend

# Tạo file .env từ file mẫu (Git Bash / macOS / Linux)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Nếu dùng PowerShell:
#   Copy-Item backend/.env.example backend/.env
#   Copy-Item frontend/.env.example frontend/.env

# Bật PostgreSQL
npm run db:up

# Áp dụng migration vào database và sinh Prisma Client
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:generate

# Chạy cả backend và frontend
npm run dev
```

Giá trị mặc định trong `.env.example` đã khớp với `docker-compose.yml`, nên chạy được ngay. Chỉ cần điền `AI_API_KEY` khi làm phần AI. **Không bao giờ commit file `.env`.**

Nếu thấy cảnh báo `npm warn install-scripts` khi cài thư viện thì có thể bỏ qua, dự án vẫn chạy bình thường.

## 3. Địa chỉ khi chạy

| Dịch vụ       | Địa chỉ                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| Frontend      | http://localhost:5173                                                       |
| Backend       | http://localhost:3000 (chưa có route nào, trả về 404 là bình thường)        |
| Prisma Studio | http://localhost:5555 (chạy bằng `npm --prefix backend run prisma:studio`)  |
| PostgreSQL    | `localhost:5432`, user `postgres`, mật khẩu `postgres`, database `quiz_app` |

## Các script

Chạy ở **thư mục gốc**:

| Lệnh              | Tác dụng                             |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Chạy backend và frontend cùng lúc    |
| `npm run db:up`   | Bật PostgreSQL (Docker)              |
| `npm run db:down` | Tắt PostgreSQL, dữ liệu vẫn được giữ |

Chạy trong **`backend/`** (hoặc thêm `--prefix backend` khi đứng ở gốc):

| Lệnh                      | Tác dụng                                        |
| ------------------------- | ----------------------------------------------- |
| `npm run dev`             | Chạy backend, tự khởi động lại khi sửa code     |
| `npm run build`           | Biên dịch TypeScript ra `dist/`                 |
| `npm start`               | Chạy bản đã build                               |
| `npm run lint`            | Kiểm tra lỗi code bằng oxlint                   |
| `npm run format`          | Định dạng code bằng Prettier                    |
| `npm run format:check`    | Kiểm tra định dạng, không sửa file (CI dùng)    |
| `npm run prisma:migrate`  | Tạo và áp dụng migration (`prisma migrate dev`) |
| `npm run prisma:generate` | Sinh lại Prisma Client                          |
| `npm run prisma:studio`   | Mở Prisma Studio để xem và sửa dữ liệu          |

Chạy trong **`frontend/`**: `dev`, `build`, `preview`, `lint`, `format`, `format:check`.

Mỗi PR vào `main` được GitHub Actions tự kiểm tra (`.github/workflows/ci.yml`): `format:check`, `lint`, `build` cho cả backend và frontend. Check báo đỏ thì không merge được. Sửa nhanh lỗi định dạng bằng `npm run format`.

## 4. Lỗi thường gặp

**Cổng 5432 bị chiếm** (`npm run db:up` báo `port is already allocated` hoặc `bind: ... 5432`)

Thường do máy đã cài sẵn PostgreSQL và nó đang chạy. Kiểm tra bằng `netstat -ano | findstr :5432` (Windows). Chọn một trong hai cách:

- Tắt PostgreSQL cài sẵn: mở `services.msc`, tìm dịch vụ `postgresql-x64-...`, bấm Stop.
- Hoặc đổi cổng cho Docker: tạo file `.env` ở **thư mục gốc** repo với nội dung `POSTGRES_PORT=5433`, chạy lại `npm run db:up`, rồi sửa `DATABASE_URL` trong `backend/.env` thành `...@localhost:5433/quiz_app...`.

**Quên tạo file `.env`**

- Backend dừng ngay với lỗi `node: .env: not found`.
- Lệnh Prisma báo `The datasource.url property is required in your Prisma config file`.

Cách sửa: làm lại bước tạo `.env` từ `.env.example` ở mục 2.

**Docker chưa bật** (`failed to connect to the docker API ... dockerDesktopLinuxEngine`)

Mở Docker Desktop, đợi đến khi báo đang chạy rồi chạy lại lệnh.

**Đổi user hoặc mật khẩu database nhưng không có tác dụng**

PostgreSQL chỉ đọc các biến này ở lần chạy đầu tiên, sau đó dữ liệu đã nằm trong volume. Muốn làm lại từ đầu thì chạy `docker compose down -v` (**xóa toàn bộ dữ liệu** trong database dev) rồi `npm run db:up`.

## 5. Làm việc với database

`docs/database.md` là bản thiết kế của cả nhóm. Prisma schema phải luôn khớp với file này.

**Khi thêm hoặc sửa bảng, cột:**

1. Thêm hoặc sửa model trong `backend/prisma/schema.prisma`.
2. Cập nhật `docs/database.md` **trong cùng PR**.
3. Tạo migration và sinh lại Prisma Client:
   ```bash
   npm --prefix backend run prisma:migrate -- --name ten-thay-doi
   npm --prefix backend run prisma:generate
   ```
4. Commit cả thư mục migration mới trong `backend/prisma/migrations/`.

**Khi pull code về và thấy có migration mới** (thư mục `backend/prisma/migrations/` có thay đổi): chạy lại

```bash
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:generate
```

Lưu ý:

- Từ Prisma 7, `prisma:migrate` **không còn tự sinh Prisma Client**, nên luôn chạy thêm `prisma:generate`.
- Prisma Client được sinh vào `backend/src/generated/prisma/`, thư mục này không commit.
- Không sửa file migration đã merge vào `main`. Cần đổi gì thì tạo migration mới.
- Prisma 7 cần driver adapter khi tạo `PrismaClient` (với PostgreSQL là `@prisma/adapter-pg`). Xem [tài liệu Prisma 7](https://www.prisma.io/docs/orm/v7).
