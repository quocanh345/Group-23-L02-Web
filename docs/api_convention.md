# Quy ước viết API

Áp dụng cho mọi endpoint của backend. [`api.md`](api.md) liệt kê từng endpoint; file này quy định **cách** viết chúng cho thống nhất.

Muốn đổi quy ước nào thì mở issue để cả nhóm bàn, không tự đổi.

## 1. Nguyên tắc chung

- Mọi API có tiền tố **`/api`**.
- Request và response đều là **JSON** (`Content-Type: application/json`).
- Tên trường dùng **camelCase**, khớp với Prisma model: `createdAt`, `subjectId`, `isCorrect`.
- Thời gian dùng chuỗi **ISO 8601 theo UTC**: `"2026-11-17T05:59:00.000Z"`. Frontend tự đổi sang giờ Việt Nam khi hiển thị.
- `id` là số nguyên.
- Dự án nhỏ nên **không đánh phiên bản** (`/v1`).

## 2. Đặt tên đường dẫn

| Quy tắc                                                           | Đúng                        | Sai                                       |
| ----------------------------------------------------------------- | --------------------------- | ----------------------------------------- |
| Danh từ số nhiều chỉ tài nguyên                                   | `/api/subjects`             | `/api/subject`, `/api/getSubjects`        |
| Nhiều từ thì nối bằng gạch ngang                                  | `/api/question-sets`        | `/api/questionSets`, `/api/question_sets` |
| Không có động từ trong đường dẫn với thao tác thêm/sửa/xóa/xem    | `DELETE /api/subjects/5`    | `POST /api/subjects/5/delete`             |
| Lồng tối đa **một cấp**, chỉ khi tài nguyên con luôn thuộc về cha | `/api/subjects/5/questions` | `/api/users/1/subjects/5/questions`       |

**Ngoại lệ, endpoint hành động:** thao tác không phải thêm/sửa/xóa/xem thì dùng `POST` kèm động từ ở cuối:

- `POST /api/attempts/10/submit` (nộp bài)
- `POST /api/ai/generate-questions` (AI sinh câu hỏi)

## 3. Phương thức HTTP

| Phương thức | Dùng khi                                        | Thành công trả về                                    |
| ----------- | ----------------------------------------------- | ---------------------------------------------------- |
| `GET`       | Đọc dữ liệu. Không bao giờ làm thay đổi dữ liệu | `200` + dữ liệu                                      |
| `POST`      | Tạo mới, hoặc endpoint hành động                | `201` + bản ghi vừa tạo (tạo mới), `200` (hành động) |
| `PATCH`     | Sửa **một phần**: chỉ gửi trường cần đổi        | `200` + bản ghi sau khi sửa                          |
| `DELETE`    | Xóa                                             | `204`, không có body                                 |

Nhóm không dùng `PUT` (thay toàn bộ bản ghi) để tránh nhầm với `PATCH`.

## 4. Định dạng response

**Một bản ghi:**

```json
{
  "data": {
    "id": 5,
    "name": "Mạng máy tính",
    "createdAt": "2026-11-17T05:59:00.000Z"
  }
}
```

**Danh sách, luôn có phân trang:**

```json
{
  "data": [{ "id": 5, "name": "Mạng máy tính" }],
  "meta": { "page": 1, "pageSize": 20, "total": 42 }
}
```

`meta.total` là tổng số bản ghi khớp bộ lọc (không chỉ trang hiện tại), để frontend tính số trang.

**Lỗi, mọi lỗi đều cùng một dạng:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [{ "field": "email", "message": "Email không đúng định dạng" }]
  }
}
```

- `code`: mã cố định để frontend xử lý bằng code, viết HOA_GẠCH_DƯỚI.
- `message`: câu tiếng Việt để hiển thị cho người dùng.
- `details`: chỉ có khi lỗi kiểm tra dữ liệu, mỗi phần tử ứng với một trường sai.

Ngoại lệ duy nhất là `GET /api/health`, vì công cụ giám sát đọc trực tiếp trường `status` (xem `api.md` mục 3).

## 5. Mã trạng thái và mã lỗi

| HTTP | `code`              | Khi nào                                                                   |
| ---- | ------------------- | ------------------------------------------------------------------------- |
| 400  | `VALIDATION_ERROR`  | Dữ liệu gửi lên sai kiểu, thiếu trường, sai định dạng                     |
| 401  | `UNAUTHENTICATED`   | Chưa đăng nhập, hoặc phiên đăng nhập hết hạn                              |
| 403  | `FORBIDDEN`         | Đã đăng nhập nhưng không đủ quyền (ví dụ learner gọi API của admin)       |
| 404  | `NOT_FOUND`         | Không tồn tại, **hoặc tồn tại nhưng thuộc về người khác** (xem mục 8)     |
| 409  | `CONFLICT`          | Trùng dữ liệu hoặc sai trạng thái, khi chưa có mã riêng cho trường hợp đó |
| 429  | `AI_QUOTA_EXCEEDED` | Hết lượt gọi AI trong ngày                                                |
| 500  | `INTERNAL_ERROR`    | Lỗi không lường trước. Không trả chi tiết lỗi kỹ thuật ra ngoài           |
| 502  | `AI_PROVIDER_ERROR` | Dịch vụ AI lỗi, quá thời gian chờ hoặc trả sai định dạng                  |

**Mã lỗi riêng** cho từng nghiệp vụ (ví dụ `EMAIL_TAKEN`, `ATTEMPT_ALREADY_SUBMITTED`) nằm ở `api.md` mục 1. Trường hợp nào đã có mã riêng thì dùng mã riêng thay cho `CONFLICT`, để frontend phân biệt được và hiện đúng thông báo.

Cần mã lỗi mới thì thêm vào bảng mã lỗi riêng trong `api.md`, trong cùng PR với code dùng mã đó.

## 6. Phân trang, lọc, sắp xếp

Áp dụng cho mọi endpoint trả về danh sách, dùng query string:

| Tham số         | Ví dụ                                    | Mặc định                         |
| --------------- | ---------------------------------------- | -------------------------------- |
| `page`          | `?page=2`                                | `1`                              |
| `pageSize`      | `?pageSize=50`                           | `20`, tối đa `100`               |
| `sort`          | `?sort=-createdAt` (dấu `-` là giảm dần) | Tùy endpoint, ghi trong `api.md` |
| Lọc theo trường | `?topic=TCP&difficulty=hard`             | Không lọc                        |

## 7. Đăng nhập và quyền truy cập

Mỗi endpoint trong `api.md` ghi rõ một trong bốn mức quyền:

| Mức            | Ý nghĩa                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------- |
| **Công khai**  | Ai cũng gọi được (đăng ký, đăng nhập)                                                        |
| **Đăng nhập**  | Phải đăng nhập                                                                               |
| **Chủ sở hữu** | Phải đăng nhập **và** là chủ môn học chứa tài nguyên đó (với lượt làm bài: là người làm bài) |
| **Admin**      | Phải đăng nhập với `role = admin`                                                            |

Cách gửi thông tin đăng nhập (cookie hay header `Authorization`) do nhóm chốt ở issue #8, rồi ghi kết quả vào đây. Trong lúc chờ, `api.md` mục 1 giả định dùng cookie `HttpOnly`.

## 8. Quy tắc bảo mật bắt buộc

1. **Không bao giờ trả `passwordHash`** trong bất kỳ response nào.
2. **Kiểm tra quyền sở hữu ở mọi endpoint có `:id`.** `id` tăng dần nên đoán được: đổi `/attempts/10` thành `/attempts/11` là thử được bài của người khác. Không phải chủ sở hữu thì trả **`404`** thay vì `403`, để không tiết lộ là bản ghi đó có tồn tại.
3. **Không nhận `userId`, `id`, `createdAt`, `role`, `score` từ body.** `userId` lấy từ thông tin đăng nhập; điểm do server tự chấm. Chỉ đọc đúng các trường được phép từ body, không truyền nguyên body vào Prisma.
4. **Kiểm tra mọi dữ liệu đầu vào** (body, query, params) trước khi dùng.
5. **Không lộ đáp án khi đang thi.** Khi trả câu hỏi cho một lượt làm bài chưa nộp ở chế độ `exam`, bỏ hẳn `isCorrect`, `correctOptionId` và `explanation` (không trả `null`). Chỉ trả các trường này sau khi nộp bài, hoặc sau khi trả lời từng câu ở chế độ `practice`. Chi tiết ở đối tượng `AttemptQuestion` trong `api.md` mục 2.
6. Lỗi `500` chỉ ghi chi tiết vào log của server, response chỉ có thông điệp chung.

## 9. Mẫu mô tả một endpoint trong `docs/api.md`

````markdown
### Tạo môn học

`POST /api/subjects` · Quyền: **Đăng nhập**

**Body**

| Trường      | Kiểu           | Bắt buộc | Ràng buộc         |
| ----------- | -------------- | -------- | ----------------- |
| name        | string         | có       | 1–150 ký tự       |
| description | string \| null | không    | Tối đa 2000 ký tự |

**Ví dụ request**

```json
{ "name": "Mạng máy tính", "description": "Ôn thi cuối kỳ" }
```

**201 Created**: trả `Subject`.

```json
{
  "data": {
    "id": 5,
    "name": "Mạng máy tính",
    "description": "Ôn thi cuối kỳ",
    "questionCount": 0,
    "questionSetCount": 0,
    "createdAt": "2026-11-17T05:59:00.000Z"
  }
}
```

**Lỗi:** `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`
````

Response trả về một đối tượng đã định nghĩa ở `api.md` mục 2 thì ghi tên đối tượng (`trả Subject`) thay vì chép lại toàn bộ trường.

Mỗi endpoint đều phải có đủ: phương thức và đường dẫn, mức quyền, tham số (path/query/body), ví dụ request, ví dụ response thành công, danh sách lỗi có thể trả về.
