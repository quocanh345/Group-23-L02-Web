import { useAuth } from '../context/AuthContext'
import PasswordField from '../components/PasswordField'

export default function SigninPage() {
  const {
    signin,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    navigate,
  } = useAuth()
  return (
    <section className="screen" id="signin">
      <p className="kicker">CHÀO MỪNG TRỞ LẠI</p>
      <h2>Đăng nhập tài khoản</h2>
      <p className="sub">Tiếp tục hành trình học tập cùng EduQuiz.</p>
      <form onSubmit={signin} noValidate>
        <div className="field">
          <label htmlFor="loginEmail">Email</label>
          <input
            id="loginEmail"
            type="email"
            autoComplete="email"
            placeholder="Nhập email của bạn"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
        </div>
        <div className="password-field">
          <PasswordField
            id="loginPassword"
            label="Mật khẩu"
            value={loginPassword}
            onChange={setLoginPassword}
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
          />
          <div className="forgot-row">
            <button
              type="button"
              className="text-button"
              onClick={() => navigate('forgot')}
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>
        <button type="submit" className="primary">
          Đăng nhập →
        </button>
      </form>
      <div className="separator">hoặc</div>
      <p className="muted-center">
        Chưa có tài khoản?{' '}
        <button type="button" onClick={() => navigate('signup')}>
          Tạo tài khoản mới
        </button>
      </p>
      <p className="info">
        Bản thử nghiệm chỉ dùng dữ liệu trong phiên mở trang. Chưa kết nối
        email, máy chủ hoặc SQL.
      </p>
    </section>
  )
}
