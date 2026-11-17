# API – Website ôn tập và thi thử trắc nghiệm tích hợp AI

Hợp đồng API giữa frontend và backend: mỗi endpoint nhận gì, trả gì, lỗi gì.

- **Frontend** dựa vào đây để dựng giao diện với dữ liệu giả trước khi backend xong.
- **Backend** dựa vào đây để viết đúng đầu vào và đầu ra.
- Cách viết chung (định dạng response, mã lỗi, đặt tên đường dẫn) nằm ở [`api_convention.md`](api_convention.md). Đọc file đó trước.
- Tên trường khớp với [`database.md`](database.md) và `backend/prisma/schema.prisma`.

Muốn đổi một endpoint thì sửa file này trong cùng PR với code, để frontend và backend luôn thấy cùng một phiên bản.

## Mục lục

1. [Tổng quan](#1-tổng-quan): đăng nhập, quyền, giới hạn AI, mã lỗi, danh sách endpoint
2. [Đối tượng dữ liệu](#2-đối-tượng-dữ-liệu)
3. [Hệ thống và tài khoản](#3-hệ-thống-và-tài-khoản)
4. [Môn học](#4-môn-học)
5. [Câu hỏi](#5-câu-hỏi)
6. [Đề](#6-đề)
7. [Làm bài](#7-làm-bài)
8. [Thống kê](#8-thống-kê)
9. [AI](#9-ai)
10. [Quản trị](#10-quản-trị)

## Cách đọc tài liệu

- **[Giả định]**: quyết định nhóm chưa chốt. Đổi được, nhưng phải sửa ở mọi chỗ liên quan trong file.
- **Quyền**: một trong bốn mức ở mục 1, ví dụ "Chủ sở hữu".
- **Lỗi**: viết đủ `HTTP + code` khi có mã lỗi riêng (`409 EMAIL_TAKEN`). Các lỗi chung viết tắt bằng số HTTP; mã `code` tương ứng xem bảng ở [`api_convention.md` mục 5](api_convention.md#5-mã-trạng-thái-và-mã-lỗi): `400` là `VALIDATION_ERROR`, `401` là `UNAUTHENTICATED`, `403` là `FORBIDDEN`, `404` là `NOT_FOUND`.
- **"kèm `meta`"**: response dạng danh sách có phân trang, xem [`api_convention.md` mục 4](api_convention.md#4-định-dạng-response).
- Ví dụ JSON trong file có thể **rút gọn**: chỉ giữ các trường cần minh họa.

---

## 1. Tổng quan

### Đăng nhập [Giả định]

Nhóm chốt cách đăng nhập ở issue #8. Hiện tài liệu giả định:

- Đăng nhập thành công thì server đặt cookie **`access_token`** chứa JWT, với `HttpOnly`, `SameSite=Lax`, `Secure` khi chạy production. Hết hạn sau 7 ngày.
- Trình duyệt tự gửi cookie ở mọi request; frontend không tự lưu token.
- Không cần thêm bảng nào trong database.

Nếu nhóm chọn header `Authorization: Bearer <token>` thay cho cookie, chỉ phần này và các endpoint ở mục 3 thay đổi: server trả token trong body, frontend tự lưu và gửi kèm ở mỗi request.

### Quyền truy cập

| Mức            | Ý nghĩa                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Công khai**  | Không cần đăng nhập                                                                                              |
| **Đăng nhập**  | Phải đăng nhập                                                                                                   |
| **Chủ sở hữu** | Phải đăng nhập và là chủ môn học chứa tài nguyên (hoặc chủ lượt làm bài). Không phải chủ thì trả `404 NOT_FOUND` |
| **Admin**      | `role = admin`                                                                                                   |

Ứng dụng là công cụ ôn tập cá nhân: mỗi người chỉ thấy và làm việc với môn học, câu hỏi, đề, lượt làm bài của chính mình. Admin cũng **không** xem được dữ liệu học tập của người khác qua các API này.

### Giới hạn lượt AI [Giả định]

Nhóm chốt con số này ở issue #9. Hiện tài liệu giả định:

- Mỗi người **20 lượt/ngày**, đọc từ biến môi trường `AI_DAILY_LIMIT` (thêm vào `backend/.env.example` khi làm phần này).
- "Ngày" tính theo giờ Việt Nam: đặt lại lúc 00:00 `Asia/Ho_Chi_Minh` (tức 17:00 UTC hôm trước).
- Mỗi request AI thành công ghi một dòng `ai_usage`. Request bị lỗi phía AI không bị tính.

### Mã lỗi riêng của dự án

Bổ sung cho bảng mã lỗi chung ở [`api_convention.md` mục 5](api_convention.md#5-mã-trạng-thái-và-mã-lỗi). Khi đã có mã riêng thì dùng mã riêng, không dùng mã chung `CONFLICT`.

| HTTP | `code`                      | Khi nào                                      |
| ---- | --------------------------- | -------------------------------------------- |
| 409  | `EMAIL_TAKEN`               | Đăng ký bằng email đã tồn tại                |
| 409  | `ATTEMPT_ALREADY_SUBMITTED` | Lưu câu trả lời hoặc nộp bài cho lượt đã nộp |
| 409  | `TIME_EXPIRED`              | Lưu câu trả lời khi đã hết giờ thi           |
| 409  | `EMPTY_QUESTION_SET`        | Bắt đầu làm một đề không có câu nào          |
| 409  | `NO_WRONG_QUESTIONS`        | Tạo đề ôn khi chưa có câu sai nào            |
| 409  | `CANNOT_CHANGE_OWN_ROLE`    | Admin tự đổi vai trò của chính mình          |

Hai mã lỗi của phần AI (`429 AI_QUOTA_EXCEEDED`, `502 AI_PROVIDER_ERROR`) nằm trong bảng chung ở `api_convention.md`.

### Danh sách endpoint

| Phương thức   | Đường dẫn                                 | Quyền                | Mô tả                                               |
| ------------- | ----------------------------------------- | -------------------- | --------------------------------------------------- |
| GET           | `/api/health`                             | Công khai            | Kiểm tra server và database                         |
| **Tài khoản** |                                           |                      |                                                     |
| POST          | `/api/auth/register`                      | Công khai            | Đăng ký                                             |
| POST          | `/api/auth/login`                         | Công khai            | Đăng nhập                                           |
| POST          | `/api/auth/logout`                        | Đăng nhập            | Đăng xuất                                           |
| GET           | `/api/auth/me`                            | Đăng nhập            | Người đang đăng nhập                                |
| **Môn học**   |                                           |                      |                                                     |
| GET           | `/api/subjects`                           | Đăng nhập            | Danh sách môn của mình                              |
| POST          | `/api/subjects`                           | Đăng nhập            | Tạo môn                                             |
| GET           | `/api/subjects/:id`                       | Chủ sở hữu           | Chi tiết môn                                        |
| PATCH         | `/api/subjects/:id`                       | Chủ sở hữu           | Sửa môn                                             |
| DELETE        | `/api/subjects/:id`                       | Chủ sở hữu           | Xóa môn                                             |
| **Câu hỏi**   |                                           |                      |                                                     |
| GET           | `/api/subjects/:subjectId/questions`      | Chủ sở hữu           | Ngân hàng câu hỏi của môn                           |
| POST          | `/api/subjects/:subjectId/questions`      | Chủ sở hữu           | Thêm một câu                                        |
| POST          | `/api/subjects/:subjectId/questions/bulk` | Chủ sở hữu           | Thêm nhiều câu một lần                              |
| POST          | `/api/questions/parse`                    | Đăng nhập            | Tách văn bản thành câu hỏi (không lưu)              |
| GET           | `/api/questions/:id`                      | Chủ sở hữu           | Chi tiết câu                                        |
| PATCH         | `/api/questions/:id`                      | Chủ sở hữu           | Sửa câu, kể cả đáp án                               |
| DELETE        | `/api/questions/:id`                      | Chủ sở hữu           | Xóa câu                                             |
| **Đề**        |                                           |                      |                                                     |
| GET           | `/api/subjects/:subjectId/question-sets`  | Chủ sở hữu           | Danh sách đề của môn                                |
| POST          | `/api/subjects/:subjectId/question-sets`  | Chủ sở hữu           | Tạo đề từ câu có sẵn                                |
| GET           | `/api/question-sets/:id`                  | Chủ sở hữu           | Chi tiết đề kèm câu hỏi                             |
| PATCH         | `/api/question-sets/:id`                  | Chủ sở hữu           | Sửa tên, danh sách câu                              |
| DELETE        | `/api/question-sets/:id`                  | Chủ sở hữu           | Xóa đề                                              |
| **Làm bài**   |                                           |                      |                                                     |
| POST          | `/api/attempts`                           | Chủ sở hữu (của đề)  | Bắt đầu ôn tập hoặc thi thử                         |
| GET           | `/api/attempts`                           | Đăng nhập            | Lịch sử làm bài                                     |
| GET           | `/api/attempts/:id`                       | Chủ sở hữu           | Chi tiết lượt làm bài                               |
| POST          | `/api/attempts/:id/answers`               | Chủ sở hữu           | Lưu câu trả lời cho một câu                         |
| POST          | `/api/attempts/:id/submit`                | Chủ sở hữu           | Nộp bài                                             |
| **Thống kê**  |                                           |                      |                                                     |
| GET           | `/api/stats/overview`                     | Đăng nhập            | Tổng quan kết quả, theo chủ đề                      |
| GET           | `/api/stats/wrong-questions`              | Đăng nhập            | Danh sách câu hay sai                               |
| **AI**        |                                           |                      |                                                     |
| GET           | `/api/ai/quota`                           | Đăng nhập            | Số lượt AI còn lại hôm nay                          |
| POST          | `/api/ai/generate-questions`              | Đăng nhập            | AI sinh câu hỏi từ tài liệu (bản nháp, không lưu)   |
| POST          | `/api/ai/solve`                           | Chủ sở hữu (của câu) | AI giải một câu, kèm giải thích                     |
| POST          | `/api/ai/review-sets`                     | Chủ sở hữu (của môn) | Tạo đề ôn từ câu sai, có thể kèm câu mới do AI sinh |
| **Quản trị**  |                                           |                      |                                                     |
| GET           | `/api/admin/users`                        | Admin                | Danh sách người dùng                                |
| PATCH         | `/api/admin/users/:id`                    | Admin                | Đổi vai trò người dùng                              |

---

## 2. Đối tượng dữ liệu

### User

| Trường    | Kiểu                     | Ghi chú |
| --------- | ------------------------ | ------- |
| id        | number                   |         |
| email     | string                   |         |
| fullName  | string                   |         |
| role      | `"learner"` \| `"admin"` |         |
| createdAt | string (ISO)             |         |

Không bao giờ có `passwordHash`.

### Subject

| Trường           | Kiểu           | Ghi chú       |
| ---------------- | -------------- | ------------- |
| id               | number         |               |
| name             | string         |               |
| description      | string \| null |               |
| questionCount    | number         | Server tự đếm |
| questionSetCount | number         | Server tự đếm |
| createdAt        | string (ISO)   |               |

### Option

| Trường    | Kiểu    | Ghi chú                              |
| --------- | ------- | ------------------------------------ |
| id        | number  |                                      |
| content   | string  |                                      |
| isCorrect | boolean |                                      |
| position  | number  | Bắt đầu từ 1, theo thứ tự A, B, C... |

### Question

| Trường               | Kiểu                               | Ghi chú                                         |
| -------------------- | ---------------------------------- | ----------------------------------------------- |
| id                   | number                             |                                                 |
| subjectId            | number                             |                                                 |
| content              | string                             |                                                 |
| explanation          | string \| null                     |                                                 |
| topic                | string \| null                     |                                                 |
| difficulty           | `"easy"` \| `"medium"` \| `"hard"` |                                                 |
| source               | `"manual"` \| `"ai"`               |                                                 |
| sourceExcerpt        | string \| null                     | Đoạn trích tài liệu làm căn cứ (câu do AI sinh) |
| options              | Option[]                           | Sắp theo `position`                             |
| createdAt, updatedAt | string (ISO)                       |                                                 |

### QuestionInput

Dùng khi gửi câu hỏi lên (tạo, tạo nhiều, sửa) và khi server trả bản nháp.

| Trường      | Kiểu                                        | Bắt buộc | Ràng buộc                                                                                                        |
| ----------- | ------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| content     | string                                      | có       | 1–5000 ký tự                                                                                                     |
| explanation | string \| null                              | không    | Tối đa 5000 ký tự                                                                                                |
| topic       | string \| null                              | không    | Tối đa 100 ký tự                                                                                                 |
| difficulty  | `"easy"` \| `"medium"` \| `"hard"`          | không    | Mặc định `medium`                                                                                                |
| options     | `{ content: string, isCorrect: boolean }[]` | có       | 2–6 phần tử; `content` 1–1000 ký tự; **đúng 1** phần tử `isCorrect: true`. Thứ tự trong mảng chính là `position` |

### QuestionSetSummary

| Trường        | Kiểu                               | Ghi chú |
| ------------- | ---------------------------------- | ------- |
| id            | number                             |         |
| subjectId     | number                             |         |
| title         | string                             |         |
| type          | `"manual"` \| `"ai"` \| `"review"` |         |
| questionCount | number                             |         |
| createdAt     | string (ISO)                       |         |

### QuestionSet

`QuestionSetSummary` cộng thêm:

| Trường    | Kiểu                                  | Ghi chú                      |
| --------- | ------------------------------------- | ---------------------------- |
| questions | `(Question & { position: number })[]` | Sắp theo `position` trong đề |

### AttemptSummary

| Trường       | Kiểu                             | Ghi chú                                           |
| ------------ | -------------------------------- | ------------------------------------------------- |
| id           | number                           |                                                   |
| set          | `{ id, title, type }`            |                                                   |
| mode         | `"practice"` \| `"exam"`         |                                                   |
| status       | `"in_progress"` \| `"submitted"` | Server tính từ `submittedAt`                      |
| timeLimitSec | number \| null                   | `null` với `practice`                             |
| startedAt    | string (ISO)                     |                                                   |
| submittedAt  | string (ISO) \| null             |                                                   |
| score        | number \| null                   | Thang 10, 2 chữ số thập phân. `null` khi chưa nộp |

### AttemptQuestion

Một câu trong lượt làm bài.

| Trường                     | Kiểu                          | Có khi nào                        |
| -------------------------- | ----------------------------- | --------------------------------- |
| id                         | number                        | Luôn có                           |
| position                   | number                        | Luôn có                           |
| content, topic, difficulty |                               | Luôn có                           |
| options                    | `{ id, content, position }[]` | Luôn có. **Không có `isCorrect`** |
| selectedOptionId           | number \| null                | Luôn có; `null` nếu chưa chọn     |
| isCorrect                  | boolean                       | Chỉ khi **được phép xem đáp án**  |
| correctOptionId            | number                        | Chỉ khi được phép xem đáp án      |
| explanation                | string \| null                | Chỉ khi được phép xem đáp án      |

**Được phép xem đáp án** khi: lượt đã nộp, **hoặc** chế độ `practice` và câu đó đã được trả lời.
Ở chế độ `exam` chưa nộp, ba trường cuối **không xuất hiện** trong response (không phải `null`, mà là không có).

### AttemptDetail

`AttemptSummary` cộng thêm:

| Trường         | Kiểu              | Ghi chú                                                                                        |
| -------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| remainingSec   | number \| null    | Chỉ với `exam` chưa nộp: số giây còn lại, server tính, không âm. Các trường hợp khác là `null` |
| questions      | AttemptQuestion[] | Sắp theo `position`                                                                            |
| correctCount   | number \| null    | Chỉ khi đã nộp                                                                                 |
| totalQuestions | number            |                                                                                                |

### AiQuota

| Trường    | Kiểu         |
| --------- | ------------ |
| limit     | number       |
| used      | number       |
| remaining | number       |
| resetsAt  | string (ISO) |

---

## 3. Hệ thống và tài khoản

### Kiểm tra hệ thống

`GET /api/health` · Quyền: **Công khai**

**200 OK**

```json
{ "data": { "status": "ok", "database": "ok" } }
```

Database không kết nối được thì trả `503` với `{ "data": { "status": "error", "database": "error" } }`. Đây là ngoại lệ duy nhất không dùng định dạng `error`, vì công cụ giám sát đọc trực tiếp trường `status`.

---

### Đăng ký

`POST /api/auth/register` · Quyền: **Công khai**

**Body**

| Trường   | Kiểu   | Bắt buộc | Ràng buộc                                                                                |
| -------- | ------ | -------- | ---------------------------------------------------------------------------------------- |
| email    | string | có       | Đúng định dạng, tối đa 255 ký tự. Server chuyển về chữ thường và bỏ khoảng trắng hai đầu |
| password | string | có       | 8–72 ký tự                                                                               |
| fullName | string | có       | 1–100 ký tự                                                                              |

**201 Created**: trả `User`, đặt cookie đăng nhập luôn.

**Lỗi:** `400 VALIDATION_ERROR`, `409 EMAIL_TAKEN`

`role` luôn là `learner`. Body có gửi `role` thì bỏ qua.

---

### Đăng nhập

`POST /api/auth/login` · Quyền: **Công khai**

**Body:** `email` (string, bắt buộc), `password` (string, bắt buộc)

**200 OK**: trả `User`, đặt cookie.

**Lỗi:** `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`

Sai email hay sai mật khẩu đều trả cùng một lỗi `401`, thông điệp "Email hoặc mật khẩu không đúng".

---

### Đăng xuất

`POST /api/auth/logout` · Quyền: **Đăng nhập**

**204 No Content**: xóa cookie.

**Lỗi:** `401 UNAUTHENTICATED`

---

### Người đang đăng nhập

`GET /api/auth/me` · Quyền: **Đăng nhập**

**200 OK**: trả `User`.

**Lỗi:** `401 UNAUTHENTICATED`

---

## 4. Môn học

### Danh sách môn

`GET /api/subjects` · Quyền: **Đăng nhập**

Chỉ trả môn do người đang đăng nhập tạo.

**Query**

| Tham số        | Mặc định     | Ghi chú                                              |
| -------------- | ------------ | ---------------------------------------------------- |
| page, pageSize | 1, 20        |                                                      |
| q              |              | Tìm trong `name`                                     |
| sort           | `-createdAt` | Cho phép: `name`, `-name`, `createdAt`, `-createdAt` |

**200 OK**: `data` là `Subject[]`, kèm `meta`.

**Lỗi:** `400 VALIDATION_ERROR`, `401`

---

### Tạo môn

`POST /api/subjects` · Quyền: **Đăng nhập**

**Body**

| Trường      | Kiểu           | Bắt buộc | Ràng buộc         |
| ----------- | -------------- | -------- | ----------------- |
| name        | string         | có       | 1–150 ký tự       |
| description | string \| null | không    | Tối đa 2000 ký tự |

**201 Created**: trả `Subject` (`questionCount` và `questionSetCount` bằng 0).

**Lỗi:** `400 VALIDATION_ERROR`, `401`

---

### Chi tiết môn

`GET /api/subjects/:id` · Quyền: **Chủ sở hữu**

**200 OK**: trả `Subject`.

**Lỗi:** `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`

---

### Sửa môn

`PATCH /api/subjects/:id` · Quyền: **Chủ sở hữu**

**Body:** `name`, `description`, như khi tạo nhưng đều không bắt buộc. Gửi `description: null` để xóa mô tả.

**200 OK**: trả `Subject`.

**Lỗi:** `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`

---

### Xóa môn

`DELETE /api/subjects/:id` · Quyền: **Chủ sở hữu**

Xóa luôn toàn bộ câu hỏi, đề và lịch sử làm bài của môn. Frontend phải hỏi xác nhận trước khi gọi.

**204 No Content**

**Lỗi:** `400`, `401`, `404 NOT_FOUND`

---

## 5. Câu hỏi

### Ngân hàng câu hỏi của môn

`GET /api/subjects/:subjectId/questions` · Quyền: **Chủ sở hữu**

**Query**

| Tham số        | Mặc định     | Ghi chú                                                        |
| -------------- | ------------ | -------------------------------------------------------------- |
| page, pageSize | 1, 20        |                                                                |
| q              |              | Tìm trong `content`                                            |
| topic          |              | Lọc đúng chủ đề                                                |
| difficulty     |              | `easy` \| `medium` \| `hard`                                   |
| source         |              | `manual` \| `ai`                                               |
| sort           | `-createdAt` | Cho phép: `createdAt`, `-createdAt`, `updatedAt`, `-updatedAt` |

**200 OK**: `data` là `Question[]`, kèm `meta`.

**Lỗi:** `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND` (môn không tồn tại hoặc không phải của mình)

---

### Thêm một câu

`POST /api/subjects/:subjectId/questions` · Quyền: **Chủ sở hữu**

**Body:** `QuestionInput`. `source` luôn là `manual`.

**Ví dụ request**

```json
{
  "content": "TCP là giao thức thuộc loại nào?",
  "explanation": "TCP thiết lập kết nối trước khi truyền dữ liệu.",
  "topic": "Tầng giao vận",
  "difficulty": "easy",
  "options": [
    { "content": "Không kết nối", "isCorrect": false },
    { "content": "Hướng kết nối", "isCorrect": true },
    { "content": "Quảng bá", "isCorrect": false },
    { "content": "Mã hóa", "isCorrect": false }
  ]
}
```

**201 Created**: trả `Question`.

**Lỗi:** `400 VALIDATION_ERROR` (gồm trường hợp không có hoặc có nhiều hơn một đáp án đúng, khi đó `details` chỉ ra `field: "options"`), `401`, `404 NOT_FOUND`

Câu hỏi và các đáp án được tạo trong **cùng một giao dịch**: lỗi giữa chừng thì không có gì được lưu.

---

### Thêm nhiều câu một lần

`POST /api/subjects/:subjectId/questions/bulk` · Quyền: **Chủ sở hữu**

Dùng sau khi tách văn bản (`/api/questions/parse`) hoặc sau khi AI sinh bản nháp (`/api/ai/generate-questions`) và người dùng đã duyệt, sửa.

**Body**

| Trường    | Kiểu                                              | Bắt buộc | Ràng buộc                                                                    |
| --------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| questions | `(QuestionInput & { source?, sourceExcerpt? })[]` | có       | 1–100 phần tử. `source` mặc định `manual`; `sourceExcerpt` tối đa 2000 ký tự |

**201 Created**: `data` gồm `createdCount` (số câu đã tạo) và `questions` (`Question[]`, cùng thứ tự với mảng gửi lên).

```json
{
  "data": {
    "createdCount": 12,
    "questions": [{ "id": 31, "content": "...", "options": [] }]
  }
}
```

**Lỗi:** `400 VALIDATION_ERROR` (`details[].field` dạng `questions[3].options`), `401`, `404 NOT_FOUND`

Tất cả hoặc không gì cả: một câu sai thì không lưu câu nào.

---

### Tách văn bản thành câu hỏi

`POST /api/questions/parse` · Quyền: **Đăng nhập**

Tách theo quy tắc cố định, **không dùng AI**, **không lưu** gì vào database, không tính lượt AI.

**Định dạng văn bản được hỗ trợ**

```
Câu 1: TCP là giao thức thuộc loại nào?
A. Không kết nối
B. Hướng kết nối
C. Quảng bá
D. Mã hóa
Đáp án: B
```

- Mỗi câu bắt đầu bằng `Câu <số>:` hoặc `<số>.` ở đầu dòng.
- Đáp án là các dòng bắt đầu bằng `A.` đến `F.` (hoặc `A)` đến `F)`).
- Đáp án đúng là dòng `Đáp án: <chữ cái>`. Không có dòng này thì mọi lựa chọn đều `isCorrect: false` và có cảnh báo; người dùng phải tự chọn đáp án đúng trước khi lưu.

**Body**

| Trường | Kiểu   | Bắt buộc | Ràng buộc     |
| ------ | ------ | -------- | ------------- |
| text   | string | có       | 1–50000 ký tự |

**200 OK** (rút gọn: chỉ hiện 1 câu, 2 lựa chọn)

```json
{
  "data": {
    "questions": [
      {
        "content": "TCP là giao thức thuộc loại nào?",
        "options": [
          { "content": "Không kết nối", "isCorrect": false },
          { "content": "Hướng kết nối", "isCorrect": true }
        ]
      }
    ],
    "warnings": [{ "index": 4, "message": "Câu 5 không có dòng 'Đáp án'" }]
  }
}
```

- `questions` theo dạng `QuestionInput`, chưa được lưu.
- `warnings[].index` là vị trí câu trong mảng `questions`, tính từ 0 (nên `index: 4` là "Câu 5").

**Lỗi:** `400 VALIDATION_ERROR`, `401`

---

### Chi tiết câu

`GET /api/questions/:id` · Quyền: **Chủ sở hữu**

**200 OK**: trả `Question`.

**Lỗi:** `400`, `401`, `404 NOT_FOUND`

---

### Sửa câu

`PATCH /api/questions/:id` · Quyền: **Chủ sở hữu**

**Body:** các trường của `QuestionInput`, đều không bắt buộc.

- Có gửi `options` thì **thay toàn bộ** danh sách đáp án (ràng buộc như khi tạo). Không gửi thì giữ nguyên.
- Thay đáp án không làm thay đổi kết quả các bài đã làm: `attempt_answers.isCorrect` đã được lưu lại tại thời điểm làm bài; `selectedOptionId` của các bài cũ trỏ tới đáp án bị xóa sẽ thành `null`.

**200 OK**: trả `Question`.

**Lỗi:** `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`

---

### Xóa câu

`DELETE /api/questions/:id` · Quyền: **Chủ sở hữu**

Câu bị gỡ khỏi mọi đề chứa nó; các câu trả lời cho câu này trong lịch sử làm bài cũng bị xóa. Điểm của các lượt đã nộp giữ nguyên.

**204 No Content**

**Lỗi:** `400`, `401`, `404 NOT_FOUND`

---

## 6. Đề

### Danh sách đề của môn

`GET /api/subjects/:subjectId/question-sets` · Quyền: **Chủ sở hữu**

**Query:** `page`, `pageSize`, `type` (`manual` \| `ai` \| `review`), `sort` (mặc định `-createdAt`; cho phép `title`, `-title`, `createdAt`, `-createdAt`)

**200 OK**: `data` là `QuestionSetSummary[]`, kèm `meta`.

**Lỗi:** `400`, `401`, `404 NOT_FOUND`

---

### Tạo đề

`POST /api/subjects/:subjectId/question-sets` · Quyền: **Chủ sở hữu**

**Body**

| Trường      | Kiểu     | Bắt buộc | Ràng buộc                                                                                                  |
| ----------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| title       | string   | có       | 1–200 ký tự                                                                                                |
| questionIds | number[] | có       | 1–200 phần tử, không trùng, **mọi câu phải thuộc môn này**. Thứ tự trong mảng chính là thứ tự câu trong đề |

`type` luôn là `manual`.

**201 Created**: trả `QuestionSet`.

**Lỗi:** `400 VALIDATION_ERROR` (câu không tồn tại, không thuộc môn, hoặc bị trùng), `401`, `404 NOT_FOUND`

---

### Chi tiết đề

`GET /api/question-sets/:id` · Quyền: **Chủ sở hữu**

Màn hình **quản lý** đề nên có cả đáp án. Màn hình **làm bài** không dùng endpoint này mà dùng `/api/attempts/:id`.

**200 OK**: trả `QuestionSet`.

**Lỗi:** `400`, `401`, `404 NOT_FOUND`

---

### Sửa đề

`PATCH /api/question-sets/:id` · Quyền: **Chủ sở hữu**

**Body:** `title`, `questionIds`, ràng buộc như khi tạo nhưng đều không bắt buộc. Có gửi `questionIds` thì thay toàn bộ danh sách và thứ tự câu.

**200 OK**: trả `QuestionSet`.

**Lỗi:** `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`

---

### Xóa đề

`DELETE /api/question-sets/:id` · Quyền: **Chủ sở hữu**

Xóa đề và các lượt làm đề đó. Câu hỏi vẫn còn trong ngân hàng của môn.

**204 No Content**

**Lỗi:** `400`, `401`, `404 NOT_FOUND`

---

## 7. Làm bài

### Bắt đầu làm bài

`POST /api/attempts` · Quyền: **Chủ sở hữu** (của đề)

**Body**

| Trường       | Kiểu                     | Bắt buộc                                                         | Ràng buộc                           |
| ------------ | ------------------------ | ---------------------------------------------------------------- | ----------------------------------- |
| setId        | number                   | có                                                               |                                     |
| mode         | `"practice"` \| `"exam"` | có                                                               |                                     |
| timeLimitSec | number \| null           | Bắt buộc với `exam`; phải là `null` hoặc bỏ trống với `practice` | Số nguyên 60–10800 (1 phút – 3 giờ) |

Server tự đặt `startedAt`. Người làm bài lấy từ thông tin đăng nhập.

**201 Created**: trả `AttemptDetail`. Mọi câu đều chưa có đáp án và giải thích.

```json
{
  "data": {
    "id": 10,
    "set": { "id": 1, "title": "Giữa kỳ", "type": "manual" },
    "mode": "exam",
    "status": "in_progress",
    "timeLimitSec": 1800,
    "startedAt": "2026-11-17T06:30:00.000Z",
    "submittedAt": null,
    "score": null,
    "remainingSec": 1800,
    "totalQuestions": 20,
    "correctCount": null,
    "questions": [
      {
        "id": 5,
        "position": 1,
        "content": "TCP là giao thức thuộc loại nào?",
        "topic": "Tầng giao vận",
        "difficulty": "easy",
        "options": [
          { "id": 17, "content": "Không kết nối", "position": 1 },
          { "id": 18, "content": "Hướng kết nối", "position": 2 },
          { "id": 19, "content": "Quảng bá", "position": 3 },
          { "id": 20, "content": "Mã hóa", "position": 4 }
        ],
        "selectedOptionId": null
      }
    ]
  }
}
```

**Lỗi:** `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND` (đề không tồn tại hoặc không phải của mình), `409 EMPTY_QUESTION_SET`

---

### Lịch sử làm bài

`GET /api/attempts` · Quyền: **Đăng nhập**

Chỉ trả lượt làm bài của chính mình.

**Query**

| Tham số        | Mặc định     | Ghi chú                                                |
| -------------- | ------------ | ------------------------------------------------------ |
| page, pageSize | 1, 20        |                                                        |
| setId          |              | Lọc theo đề                                            |
| subjectId      |              | Lọc theo môn                                           |
| mode           |              | `practice` \| `exam`                                   |
| status         |              | `in_progress` \| `submitted`                           |
| sort           | `-startedAt` | Cho phép: `startedAt`, `-startedAt`, `score`, `-score` |

**200 OK**: `data` là `AttemptSummary[]`, kèm `meta`.

**Lỗi:** `400`, `401`

---

### Chi tiết lượt làm bài

`GET /api/attempts/:id` · Quyền: **Chủ sở hữu**

Dùng để làm tiếp một bài dở (tải lại trang không mất bài) và để xem lại bài đã nộp. Việc ẩn hay hiện đáp án theo quy tắc ở đối tượng `AttemptQuestion`.

**200 OK**: trả `AttemptDetail`.

**Lỗi:** `400`, `401`, `404 NOT_FOUND`

---

### Lưu câu trả lời

`POST /api/attempts/:id/answers` · Quyền: **Chủ sở hữu**

Gọi mỗi lần người dùng chọn hoặc đổi đáp án. Chọn lại câu đã trả lời thì **cập nhật** câu trả lời cũ, không tạo thêm.

**Body**

| Trường           | Kiểu           | Bắt buộc | Ràng buộc                                                       |
| ---------------- | -------------- | -------- | --------------------------------------------------------------- |
| questionId       | number         | có       | Phải là câu **thuộc đề** của lượt làm bài này                   |
| selectedOptionId | number \| null | có       | Phải là đáp án **của đúng câu** `questionId`. `null` để bỏ chọn |

Server tự tính và lưu `isCorrect`.

**200 OK**, chế độ `exam`: không tiết lộ đúng sai

```json
{ "data": { "questionId": 5, "selectedOptionId": 18 } }
```

**200 OK**, chế độ `practice`: trả đúng sai và giải thích ngay

```json
{
  "data": {
    "questionId": 5,
    "selectedOptionId": 17,
    "isCorrect": false,
    "correctOptionId": 18,
    "explanation": "TCP thiết lập kết nối trước khi truyền dữ liệu."
  }
}
```

**Lỗi:** `400 VALIDATION_ERROR` (câu không thuộc đề, đáp án không thuộc câu), `401`, `404 NOT_FOUND`, `409 ATTEMPT_ALREADY_SUBMITTED`, `409 TIME_EXPIRED`

Thi thử: câu trả lời gửi tới sau `startedAt + timeLimitSec` cộng **30 giây** (bù độ trễ mạng) bị từ chối với `TIME_EXPIRED`.

---

### Nộp bài

`POST /api/attempts/:id/submit` · Quyền: **Chủ sở hữu**

Không có body. Frontend tự gọi endpoint này khi đồng hồ về 0.

Server:

1. Tạo câu trả lời `selectedOptionId: null, isCorrect: false` cho mọi câu chưa trả lời, để thống kê đủ dữ liệu.
2. Tính `score = số câu đúng / tổng số câu × 10`, làm tròn 2 chữ số thập phân.
3. Đặt `submittedAt`.

Cả ba bước trong **cùng một giao dịch**. Vẫn cho nộp khi đã quá giờ; điểm tính trên các câu đã lưu.

**200 OK**: trả `AttemptDetail` đầy đủ đáp án và giải thích.

**Lỗi:** `400`, `401`, `404 NOT_FOUND`, `409 ATTEMPT_ALREADY_SUBMITTED`

---

## 8. Thống kê

Chỉ tính các lượt **đã nộp** của người đang đăng nhập.

### Tổng quan

`GET /api/stats/overview` · Quyền: **Đăng nhập**

**Query:** `subjectId` (không bắt buộc; không truyền thì tính mọi môn), `mode` (`practice` \| `exam`, không bắt buộc)

**200 OK**

```json
{
  "data": {
    "attemptCount": 8,
    "averageScore": 7.15,
    "answeredCount": 160,
    "correctCount": 118,
    "correctRate": 0.74,
    "byTopic": [
      {
        "topic": "Tầng giao vận",
        "answeredCount": 40,
        "correctCount": 22,
        "correctRate": 0.55
      },
      {
        "topic": null,
        "answeredCount": 12,
        "correctCount": 10,
        "correctRate": 0.83
      }
    ]
  }
}
```

- `byTopic` sắp theo `correctRate` tăng dần (chủ đề yếu nhất lên đầu). `topic: null` là câu chưa gắn chủ đề.
- Chưa làm bài nào thì các số đếm bằng 0, `averageScore` và `correctRate` là `null`, `byTopic` là mảng rỗng.

**Lỗi:** `400`, `401`, `404 NOT_FOUND` (`subjectId` không phải của mình)

---

### Câu hay sai

`GET /api/stats/wrong-questions` · Quyền: **Đăng nhập**

**Query**

| Tham số        | Mặc định      | Ghi chú                                                                                         |
| -------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| page, pageSize | 1, 20         |                                                                                                 |
| subjectId      |               | Không bắt buộc                                                                                  |
| topic          |               | Không bắt buộc                                                                                  |
| minWrong       | 1             | Chỉ lấy câu sai ít nhất ngần này lần                                                            |
| sort           | `-wrongCount` | Cho phép: `wrongCount`, `-wrongCount`, `lastWrongAt`, `-lastWrongAt`, `wrongRate`, `-wrongRate` |

**200 OK**

```json
{
  "data": [
    {
      "question": {
        "id": 5,
        "content": "TCP là giao thức thuộc loại nào?",
        "topic": "Tầng giao vận",
        "difficulty": "easy"
      },
      "answeredCount": 4,
      "wrongCount": 3,
      "wrongRate": 0.75,
      "lastWrongAt": "2026-11-17T06:58:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 15 }
}
```

`lastWrongAt` là `submittedAt` của lượt gần nhất làm sai câu đó.

**Lỗi:** `400`, `401`, `404 NOT_FOUND`

---

## 9. AI

Quy tắc chung cho các endpoint gọi AI:

- API key chỉ nằm ở backend.
- Kiểm tra hết lượt **trước** khi gọi AI; chỉ ghi `ai_usage` khi gọi **thành công**.
- AI phải trả JSON đúng khuôn. Sai khuôn thì thử lại **một lần**; vẫn sai thì trả `502 AI_PROVIDER_ERROR`.
- Thời gian chờ tối đa 60 giây. Frontend phải hiện trạng thái đang xử lý.
- Endpoint nào tốn lượt thì response thành công có kèm `quota` (dạng `AiQuota`) để frontend cập nhật số lượt còn lại.

### Lượt AI còn lại

`GET /api/ai/quota` · Quyền: **Đăng nhập**

**200 OK**

```json
{
  "data": {
    "limit": 20,
    "used": 3,
    "remaining": 17,
    "resetsAt": "2026-11-17T17:00:00.000Z"
  }
}
```

**Lỗi:** `401`

---

### AI sinh câu hỏi từ tài liệu

`POST /api/ai/generate-questions` · Quyền: **Đăng nhập** · Tốn **1 lượt**

Trả **bản nháp**, không lưu. Người dùng xem, sửa, xóa bớt rồi lưu bằng `POST /api/subjects/:subjectId/questions/bulk` với `source: "ai"`.

**Body**

| Trường     | Kiểu                               | Bắt buộc | Ràng buộc                      |
| ---------- | ---------------------------------- | -------- | ------------------------------ |
| text       | string                             | có       | 100–20000 ký tự                |
| count      | number                             | có       | Số nguyên 1–20                 |
| difficulty | `"easy"` \| `"medium"` \| `"hard"` | không    | Không truyền thì AI tự chọn    |
| topic      | string                             | không    | Gợi ý chủ đề, tối đa 100 ký tự |

**200 OK**

```json
{
  "data": {
    "questions": [
      {
        "content": "TCP là giao thức thuộc loại nào?",
        "explanation": "Đoạn văn nêu TCP là giao thức hướng kết nối.",
        "topic": "Tầng giao vận",
        "difficulty": "easy",
        "sourceExcerpt": "TCP là giao thức hướng kết nối, đảm bảo dữ liệu đến đúng thứ tự",
        "options": [
          { "content": "Không kết nối", "isCorrect": false },
          { "content": "Hướng kết nối", "isCorrect": true },
          { "content": "Quảng bá", "isCorrect": false },
          { "content": "Mã hóa", "isCorrect": false }
        ]
      }
    ],
    "quota": {
      "limit": 20,
      "used": 4,
      "remaining": 16,
      "resetsAt": "2026-11-17T17:00:00.000Z"
    }
  }
}
```

Server kiểm tra lại từng câu AI trả về theo ràng buộc của `QuestionInput` và loại bỏ câu sai (ví dụ không có đáp án đúng). Vì vậy số câu trả về có thể ít hơn `count`.

**Lỗi:** `400 VALIDATION_ERROR`, `401`, `429 AI_QUOTA_EXCEEDED`, `502 AI_PROVIDER_ERROR`

---

### AI giải một câu

`POST /api/ai/solve` · Quyền: **Chủ sở hữu** (của câu) · Tốn **1 lượt**

Dùng để kiểm tra đáp án đã lưu có đúng không. **Không tự sửa** câu hỏi; người dùng tự quyết rồi gọi `PATCH /api/questions/:id`.

**Body:** `questionId` (number, bắt buộc)

**200 OK**

```json
{
  "data": {
    "questionId": 5,
    "suggestedOptionId": 18,
    "explanation": "TCP thiết lập kết nối bằng bắt tay ba bước trước khi truyền dữ liệu.",
    "matchesSavedAnswer": true,
    "quota": {
      "limit": 20,
      "used": 5,
      "remaining": 15,
      "resetsAt": "2026-11-17T17:00:00.000Z"
    }
  }
}
```

`matchesSavedAnswer: false` nghĩa là AI chọn khác với đáp án đang lưu. Frontend nên làm nổi bật để người dùng xem lại.

**Lỗi:** `400`, `401`, `404 NOT_FOUND`, `429 AI_QUOTA_EXCEEDED`, `502 AI_PROVIDER_ERROR`

---

### Tạo đề ôn từ câu sai

`POST /api/ai/review-sets` · Quyền: **Chủ sở hữu** (của môn) · Tốn **1 lượt nếu `newQuestionCount > 0`**, ngược lại không tốn

Server:

1. Lấy tối đa `wrongQuestionCount` câu sai nhiều nhất của môn (cách tính như `/api/stats/wrong-questions`).
2. Nếu `newQuestionCount > 0`: gửi các câu đó cho AI để sinh thêm câu **mới** cùng chủ đề; lưu vào ngân hàng câu hỏi với `source: "ai"`.
3. Tạo đề `type: "review"` gồm câu sai trước, câu mới sau.

Các bước lưu trong **cùng một giao dịch**.

**Body**

| Trường             | Kiểu   | Bắt buộc | Ràng buộc                                         |
| ------------------ | ------ | -------- | ------------------------------------------------- |
| subjectId          | number | có       |                                                   |
| title              | string | không    | 1–200 ký tự. Mặc định `"Ôn tập câu sai – <ngày>"` |
| wrongQuestionCount | number | có       | Số nguyên 1–30                                    |
| newQuestionCount   | number | không    | Số nguyên 0–20, mặc định 0                        |

**201 Created**: `data` là `QuestionSet`; nếu có dùng AI thì có thêm trường `quota` (dạng `AiQuota`).

**Lỗi:** `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`, `409 NO_WRONG_QUESTIONS`, `429 AI_QUOTA_EXCEEDED`, `502 AI_PROVIDER_ERROR`

AI lỗi thì **không** tạo đề, để người dùng thử lại hoặc đặt `newQuestionCount: 0`.

---

## 10. Quản trị

### Danh sách người dùng

`GET /api/admin/users` · Quyền: **Admin**

**Query:** `page`, `pageSize`, `q` (tìm trong `email` và `fullName`), `role`, `sort` (mặc định `-createdAt`)

**200 OK**: `data` là `User[]`, kèm `meta`.

**Lỗi:** `400`, `401`, `403 FORBIDDEN`

---

### Đổi vai trò người dùng

`PATCH /api/admin/users/:id` · Quyền: **Admin**

**Body:** `role` (`"learner"` \| `"admin"`, bắt buộc)

**200 OK**: trả `User`.

**Lỗi:** `400`, `401`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CANNOT_CHANGE_OWN_ROLE`
