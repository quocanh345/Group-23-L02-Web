# EduQuiz: Tái cấu trúc React + TypeScript

Dự án EduQuiz đã được tái cấu trúc bằng **React + TypeScript**, chia mã nguồn thành nhiều file và thư mục nhỏ để dễ dàng quản lý, chỉnh sửa, bảo trì và phát triển thêm các chức năng.

## 1. Hướng dẫn cài đặt

Sao chép toàn bộ nội dung trong thư mục `src/` của bộ mã nguồn mới vào thư mục `frontend/src/` trong dự án hiện tại.

**Lưu ý:** Giữ nguyên các file sau trong thư mục `frontend/`:

- `package.json`: Quản lý các thư viện và lệnh chạy dự án.
- `vite.config.ts`: Cấu hình công cụ Vite.
- `index.html`: File HTML chính của ứng dụng.

## 2. Cấu trúc mã nguồn

| File / Thư mục | Chức năng |
|---|---|
| `App.tsx` | Điều hướng giữa các trang và quản lý bố cục giao diện chung. |
| `pages/` | Chứa các component giao diện riêng cho từng màn hình đăng nhập, đăng ký, quên mật khẩu, OTP... |
| `components/` | Chứa các thành phần giao diện có thể tái sử dụng như ô nhập mật khẩu, hiển thị quy tắc và phần giới thiệu. |
| `hooks/useEduQuizAuth.ts` | Quản lý trạng thái giao diện và xử lý các chức năng demo, bao gồm xác thực OTP. |
| `context/AuthContext.tsx` | Chia sẻ trạng thái và các hàm xử lý giữa những component trong ứng dụng. |
| `utils/auth.ts` | Chứa các hàm tiện ích độc lập như kiểm tra email và tạo mã OTP. |
| `types/auth.ts` | Định nghĩa các kiểu dữ liệu TypeScript dùng chung. |
| `App.css` | Chứa các CSS thiết kế giao diện EduQuiz ban đầu. |
| `index.css` | Chứa các CSS áp dụng chung cho toàn bộ ứng dụng. |

## 3. Hướng dẫn chạy dự án

Mở Terminal và di chuyển đến thư mục `frontend/`.

**Bước 1: Cài đặt các thư viện cần thiết**

```bash
npm install
```

**Bước 2: Khởi chạy ứng dụng**

```bash
npm run dev
```

Sau khi khởi chạy thành công, mở địa chỉ mà Vite hiển thị trong Terminal để truy cập website.

## 4. Lưu ý về phiên bản thử nghiệm (Demo)

Hiện tại, hệ thống EduQuiz mới chỉ là **phiên bản thử nghiệm giao diện và chức năng đăng nhập/đăng ký**.

Các giới hạn của phiên bản này:

- **Dữ liệu tài khoản:** Chỉ được lưu tạm thời trong bộ nhớ của trình duyệt.
- **Mật khẩu:** Đang được lưu dưới dạng văn bản thuần (plaintext), chưa được mã hóa hoặc băm an toàn.
- **Mã OTP:** Được tạo giả lập và hiển thị trực tiếp trên giao diện, chưa gửi qua email thật.
- **Backend:** Chưa kết nối với máy chủ xử lý đăng nhập/đăng ký.
- **Email:** Chưa tích hợp dịch vụ gửi email xác thực.

**Cảnh báo bảo mật:** Không sử dụng cơ chế xác thực của bản demo này cho website thực tế hoặc môi trường production.

Khi phát triển phiên bản chính thức, cần tích hợp backend, cơ sở dữ liệu và cơ chế xác thực an toàn để quản lý tài khoản người dùng.