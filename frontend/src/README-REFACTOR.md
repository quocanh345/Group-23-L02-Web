# EduQuiz: React + TypeScript refactor

Copy the contents of `src/` into your existing `frontend/src/` folder. Keep your existing `frontend/package.json`, `vite.config.ts`, and `index.html`.

## Structure

- `App.tsx`: page routing and shared layout.
- `pages/`: one component per auth screen.
- `components/`: reusable input, rule indicator and hero.
- `hooks/useEduQuizAuth.ts`: UI state and demo flows, including OTP.
- `context/AuthContext.tsx`: shares the hook state with screen components.
- `utils/auth.ts`: standalone email and OTP helpers.
- `types/auth.ts`: shared TypeScript models.
- `App.css`: original styles; `index.css`: global styles.

## Run

From `frontend/`:

```sh
npm install
npm run dev
```

This is still a demo: account data and plaintext passwords remain in browser memory, OTP appears on screen, no real backend or email is integrated. Do not use demo authentication for production.

## Quy tắc biểu mẫu (demo)

- Đăng nhập bằng **email** và mật khẩu, không dùng tên hiển thị.
- Khi đăng ký nhập **họ và tên** (1–100 ký tự). Tên này hiển thị trên dashboard sau khi đăng nhập.
- Mật khẩu đăng ký, đăng nhập và đặt lại: **8–72 ký tự**.
- OTP vẫn chỉ là demo, chưa kết nối backend và không gửi email thật.
