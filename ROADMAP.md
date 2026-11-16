# Lộ trình dự án

**Đề tài:** Xây dựng website ôn tập và thi thử trắc nghiệm tích hợp AI hỗ trợ sinh đề
**Thời gian dự kiến:** 16/11 – 20/12/2026 (5 tuần), dự phòng đến 27/12
**Nguyên tắc:** chưa biết lịch báo cáo, nên **vòng chính phải chạy được trước cuối tuần 4**. Tuần 5 là để hoàn thiện và làm đệm nếu thầy báo lịch sớm.

---

## 1. Đích đến

Vòng chính cần chạy trơn tru khi demo:

```
Tạo đề (thủ công hoặc AI sinh từ tài liệu)
   → Làm bài thi thử
   → Xem kết quả và danh sách câu sai
   → AI sinh đề ôn tập từ các câu sai
```

Mọi việc trong lộ trình đều phục vụ vòng này. Việc nào không phục vụ thì để sau.

---

## 2. Các mốc theo tuần

Mỗi tuần là một **Milestone** trên GitHub. Mọi issue phải gắn vào một milestone.

### Tuần 0 (13 – 15/11): Hoàn tất thiết lập
- [ ] Cả 3 người đã vào repo và xem được bảng Project
- [ ] Gộp còn một bảng Project, dùng label `frontend` / `backend` để phân biệt
- [ ] PR đầu tiên: `CONTRIBUTING.md`, mẫu PR, `ROADMAP.md`, khung thư mục

**Mốc:** cả nhóm đã thử một lần quy trình issue → nhánh → PR → review → merge.

### Tuần 1 (16 – 22/11): Chốt nền tảng
Tuần quan trọng nhất. Chốt kỹ ở đây thì các tuần sau làm song song được, không phải chờ nhau.
- [ ] Chốt công nghệ (xem mục 4)
- [ ] Vẽ sơ đồ database: các bảng, cột, quan hệ → `docs/database.md`
- [ ] Viết **hợp đồng API**: mỗi endpoint nhận gì, trả gì → `docs/api.md`
- [ ] Phác thảo các màn hình chính (vẽ tay hoặc Figma đều được)
- [ ] Dựng khung backend: chạy được, kết nối được database
- [ ] Dựng khung frontend: chạy được, có điều hướng giữa các trang
- [ ] Tạo issue cho toàn bộ tính năng Lõi, gắn milestone và người phụ trách

**Mốc:** frontend gọi được một API của backend và hiện dữ liệu lấy từ database.

### Tuần 2 (23 – 29/11): Tài khoản và quản lý đề
- [ ] Đăng ký, đăng nhập, đăng xuất, mã hóa mật khẩu
- [ ] Phân quyền người học / quản trị viên
- [ ] Tạo, sửa, xóa môn học và đề
- [ ] Thêm, sửa, xóa câu hỏi thủ công (gồm sửa đáp án)
- [ ] Dán text để tự tách thành từng câu hỏi

**Mốc:** đăng nhập, tạo một đề và thêm được câu hỏi vào đề.

### Tuần 3 (30/11 – 6/12): Ôn tập và thi thử
- [ ] Chế độ ôn tập: làm từng câu, xem đáp án và giải thích ngay
- [ ] Thi thử: chọn số câu, đặt thời gian, đồng hồ đếm ngược, tự nộp khi hết giờ
- [ ] Chấm điểm tự động, xem lại bài làm
- [ ] Lưu từng lần làm bài và từng câu trả lời vào database

**Mốc:** làm trọn một bài thi thử, nộp bài và xem lại điểm.

### Tuần 4 (7 – 13/12): AI và thống kê
- [ ] Gọi API AI qua backend, key nằm trong `.env`
- [ ] AI sinh câu hỏi từ tài liệu, trả về đúng định dạng JSON
- [ ] AI giải câu hỏi kèm giải thích
- [ ] Lịch sử làm bài, danh sách câu hay sai
- [ ] **AI sinh đề ôn tập từ các câu sai**
- [ ] Giới hạn số lượt gọi AI mỗi người mỗi ngày

**Mốc:** vòng chính ở mục 1 chạy trọn vẹn. Đây là mốc bắt buộc.

### Tuần 5 (14 – 20/12): Hoàn thiện và chuẩn bị báo cáo
- [ ] **Đóng băng tính năng:** không thêm tính năng mới, chỉ sửa lỗi
- [ ] Kiểm thử toàn bộ vòng chính, mỗi người thử phần người khác làm
- [ ] Đưa bản demo lên mạng (deploy) hoặc chuẩn bị chạy ổn định trên máy
- [ ] Viết báo cáo, làm slide
- [ ] Viết kịch bản demo và tập thử ít nhất một lần
- [ ] Chuẩn bị dữ liệu mẫu (vài đề, vài lần làm bài) để demo không bắt đầu từ trống

**Mốc:** bản demo ổn định, báo cáo và slide hoàn chỉnh.

### Dự phòng (21 – 27/12)
Nếu thầy cho thêm thời gian, chọn làm các phần Mở rộng: nhập PDF/Word, biểu đồ thống kê, học theo nhóm.

---

## 3. Phân công gợi ý

Mỗi người có một mảng chính, nhưng ai cũng review code của người khác.

| Vai trò | Phụ trách chính | Người |
|---|---|---|
| Frontend | Giao diện, gọi API, trải nghiệm làm bài | |
| Backend lõi | Tài khoản, phân quyền, đề, câu hỏi, thi thử | |
| Backend AI và dữ liệu | Tích hợp AI, thống kê, giới hạn lượt, dữ liệu mẫu | |

Báo cáo: mỗi người tự viết phần mình làm, một người gom và chỉnh thống nhất.

---

## 4. Quyết định cần chốt trong tuần 1

Ghi mỗi quyết định thành một issue, chốt xong thì đóng issue và ghi kết quả vào đây.

| Quyết định | Kết quả |
|---|---|
| Framework frontend | |
| Framework backend | |
| Hệ quản trị cơ sở dữ liệu | |
| Nhà cung cấp API AI và model | |
| Cách đăng nhập (session hay JWT) | |
| Nơi deploy bản demo | |
| Ngôn ngữ viết commit (Việt hay Anh) | |
| Ngày họp tuần cố định | |

---

## 5. Nhịp làm việc hằng tuần

- **Đầu tuần – họp 15 phút:** xem milestone tuần này, kéo việc sang cột Todo, mỗi người nhận việc.
- **Trong tuần:** làm theo quy trình trong `CONTRIBUTING.md`, review PR trong 24 giờ.
- **Cuối tuần – kiểm tra mốc:** kéo `main` về, chạy thử. Mốc tuần đạt hay chưa? Chưa đạt thì phần còn thiếu thành việc ưu tiên đầu tuần sau.

---

## 6. Khi bị trễ: cắt theo thứ tự này

1. Cắt các phần **Mở rộng**
2. Giản lược giao diện (chạy đúng quan trọng hơn đẹp)
3. Giản lược thống kê (danh sách câu sai là đủ, chưa cần biểu đồ)
4. **Không cắt vòng chính** ở mục 1

---

## 7. Dấu hiệu đang lạc hướng

Gặp một trong các dấu hiệu dưới đây thì nêu ra ngay trong buổi họp gần nhất:

- Có người làm tính năng không nằm trong lộ trình
- Một PR mở quá 3 ngày chưa được review hoặc chưa merge
- `main` không chạy được
- Có issue trong tuần mà không ai nhận
- Một người ôm hết việc, hoặc một người không có việc
- Đến cuối tuần 4 mà vòng chính chưa chạy trọn
