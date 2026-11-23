# Quy ước làm việc nhóm

Tài liệu này là thỏa thuận chung của nhóm. Ai cũng đọc trước khi bắt đầu code. Muốn đổi quy ước nào thì mở issue để cả nhóm bàn, không tự đổi.

## 1. Nguyên tắc chung

1. **Không push thẳng lên `main`.** Mọi thay đổi đi qua Pull Request (PR) và được ít nhất 1 người khác duyệt.
2. **Mỗi việc đều có issue.** Không có issue thì không code.
3. **Việc nhỏ, làm xong nhanh.** Một issue nên làm xong trong 1–3 ngày. Lớn hơn thì chia nhỏ.
4. **Quyết định quan trọng phải ghi lại** trong issue, không chỉ nói trong Zalo (tin nhắn trôi mất, issue thì còn).
5. **Không bao giờ commit bí mật** (API key, mật khẩu). Dùng file `.env` (đã nằm trong `.gitignore`) và cập nhật `.env.example`.

## 2. Vòng đời một đầu việc

```
Issue → Nhánh mới → Commit → Mở PR → Review → Merge vào main → Issue tự đóng
```

1. Nhận một issue trên bảng Project, gán tên mình (Assignee), kéo sang cột **In Progress**.
2. Cập nhật `main` mới nhất rồi tạo nhánh:
   ```bash
   git switch main
   git pull
   git switch -c feat/12-dang-nhap
   ```
3. Code, commit nhỏ và thường xuyên (xem mục 5).
4. Đẩy nhánh lên và mở PR vào `main`, kéo thẻ sang **In Review**.
5. Một bạn khác review. Sửa theo góp ý nếu có.
6. Được duyệt thì bấm **Squash and merge**, rồi xóa nhánh. Issue tự đóng, thẻ sang **Done**.

## 3. Issue

**Khi nào tạo:** một tính năng cần làm, một lỗi phát hiện ra, một việc cần thống nhất (ví dụ chọn thư viện).

**Tiêu đề:** ngắn, bắt đầu bằng động từ.
- `Làm API đăng nhập`
- `Lỗi: đồng hồ thi thử không tự nộp bài khi hết giờ`

**Nội dung tối thiểu:**
```
Mô tả: cần làm gì, vì sao
Tiêu chí hoàn thành:
- [ ] ...
- [ ] ...
```

**Nhãn (label):** `frontend`, `backend`, `database`, `ai`, `bug`, `docs`.

## 4. Bảng Project

| Cột | Ý nghĩa |
|---|---|
| **Backlog** | Mọi việc đã nghĩ ra, chưa xếp lịch |
| **Todo** | Việc sẽ làm trong tuần này |
| **In Progress** | Đang làm. Mỗi người tối đa 2 thẻ |
| **In Review** | Đã mở PR, chờ duyệt |
| **Done** | Đã merge |

Ai đổi trạng thái việc của mình thì tự kéo thẻ. Nhìn bảng là biết cả nhóm đang ở đâu.

## 5. Tên nhánh

```
<loại>/<số-issue>-<mô-tả-ngắn>
```
- `feat/12-dang-nhap`
- `fix/27-dong-ho-thi-thu`
- `docs/5-huong-dan-cai-dat`

Viết thường, không dấu, nối bằng gạch ngang.

## 6. Commit message

Theo chuẩn **Conventional Commits**:

```
<loại>(<phạm vi>): <mô tả ngắn>
```

| Loại | Dùng khi |
|---|---|
| `feat` | Thêm tính năng |
| `fix` | Sửa lỗi |
| `docs` | Sửa tài liệu |
| `style` | Định dạng code, không đổi logic |
| `refactor` | Viết lại code, không đổi hành vi |
| `test` | Thêm hoặc sửa test |
| `chore` | Việc lặt vặt: cài thư viện, cấu hình |

Phạm vi là phần bị ảnh hưởng: `auth`, `quiz`, `exam`, `stats`, `ai`, `ui`...

Ví dụ:
- `feat(auth): thêm API đăng ký tài khoản`
- `fix(exam): tự nộp bài khi hết giờ`
- `chore: cài thư viện bcrypt`

Quy tắc:
- Mỗi commit một ý. Không gom "sửa linh tinh" vào một commit.
- Mô tả viết như ra lệnh: "thêm...", "sửa...", không viết "đã thêm...".
- Nhóm thống nhất một ngôn ngữ cho phần mô tả (tiếng Việt hoặc tiếng Anh) và dùng nhất quán.

## 7. Pull Request

**Tiêu đề PR** viết theo đúng format commit, vì khi **Squash and merge**, tiêu đề PR trở thành commit duy nhất trên `main`.

**Mô tả PR** dùng mẫu có sẵn (`.github/pull_request_template.md`). Bắt buộc có dòng `Closes #<số issue>` để issue tự đóng khi merge.

Quy tắc:
- PR nhỏ, nên dưới khoảng 400 dòng thay đổi. Lớn hơn thì chia nhỏ.
- Trước khi mở PR: tự chạy thử, kiểm tra không còn `console.log` thừa, không có file `.env`.
- CI tự chạy `format:check`, `lint`, `build` cho backend và frontend ở mỗi PR. Check phải xanh mới merge được. Báo lỗi định dạng thì chạy `npm run format` rồi commit lại.
- Nếu `main` đã thay đổi trong lúc làm, cập nhật nhánh của mình rồi kiểm tra lại.

## 8. Review

Người review trong vòng **24 giờ**. Khi review, kiểm tra:
- Code có làm đúng tiêu chí hoàn thành của issue không?
- Có chạy được trên máy mình không?
- Có lộ bí mật, có kiểm tra dữ liệu đầu vào không?
- Có chỗ nào khó hiểu cần đặt tên lại hoặc thêm chú thích không?

Góp ý vào code, không nhắm vào người. Chọn **Approve** nếu ổn, **Request changes** nếu cần sửa và nói rõ sửa gì.

## 9. Giao tiếp

- **Zalo nhóm:** trao đổi nhanh, nhắc nhau review.
- **Issue và PR:** nơi ghi lại quyết định và thảo luận kỹ thuật.
- **Họp ngắn mỗi tuần (15 phút)**, mỗi người trả lời ba câu: tuần trước làm gì, tuần này làm gì, đang vướng gì. Sau họp cập nhật cột **Todo**.
- Nếu sắp trễ hạn, báo sớm trong nhóm để cả nhóm điều chỉnh.

## 10. Thế nào là "xong"

Một việc chỉ được tính là xong khi:
- [ ] Chạy đúng tiêu chí hoàn thành của issue
- [ ] PR đã được duyệt và merge vào `main`
- [ ] Issue đã đóng, thẻ nằm ở cột **Done**
- [ ] Tài liệu (`README`, `.env.example`) đã cập nhật nếu có thay đổi liên quan

## 11. Chia lớp ở backend

Mỗi request đi qua ba lớp, mỗi lớp chỉ gọi lớp ngay dưới nó:

```
route → controller → service → repository → prisma
```

| Lớp | File | Làm gì | Không được làm |
|---|---|---|---|
| Controller | `<module>.controller.ts` | Đọc và kiểm tra `req`, gọi service, đổi kết quả hoặc lỗi thành HTTP | Import `prisma`, chứa logic nghiệp vụ |
| Service | `<module>.service.ts` | Logic nghiệp vụ: kiểm tra điều kiện, mã hóa mật khẩu, ghép nhiều truy vấn | Import `prisma`, đụng tới `req`/`res` |
| Repository | `<module>.repository.ts` | Truy vấn database qua Prisma | Chứa logic nghiệp vụ, đụng tới `req`/`res` |

Quy tắc:
- **Chỉ repository được import `prisma`** (từ `src/lib/prisma.ts`). Không tạo `PrismaClient` mới ở chỗ khác.
- Repository chỉ trả các trường an toàn. Hàm nào buộc phải trả trường nhạy cảm (ví dụ `passwordHash`) thì tên hàm phải nói rõ, như `findByEmailWithPassword`.
- Repository đổi lỗi của Prisma (`P2002`, `P2025`...) thành lỗi riêng (ví dụ `EmailTakenError`, `UserNotFoundError` trong `users/user.errors.ts`). Service và controller kiểm tra bằng `instanceof`, không so sánh chuỗi thông báo.
