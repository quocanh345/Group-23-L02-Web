import { useAuth } from '../context/AuthContext'
import PasswordField from '../components/PasswordField'
import Rule from '../components/Rule'

export default function SignupPage() {
  const {
    signup,
    fullName,
    setFullName,
    email,
    setEmail,
    signupPassword,
    setSignupPassword,
    signupConfirm,
    setSignupConfirm,
    navigate,
  } = useAuth()
  return (
    <section className="screen" id="signup">
      <p className="kicker">BẮT ĐẦU HÀNH TRÌNH MỚI</p>
      <h2>Tạo tài khoản</h2>
      <p className="sub">Chỉ vài bước để bắt đầu học tập thông minh.</p>
      <form onSubmit={signup} noValidate>
        <div className="field">
          <label htmlFor="signupFullName">Họ và tên</label>
          <input
            id="signupFullName"
            autoComplete="name"
            maxLength={100}
            placeholder="Nhập họ và tên của bạn"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="signupEmail">Email</label>
          <input
            id="signupEmail"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <PasswordField
          id="signupPassword"
          label="Mật khẩu"
          value={signupPassword}
          onChange={setSignupPassword}
          placeholder="Tạo mật khẩu"
          autoComplete="new-password"
        />
        <PasswordField
          id="signupConfirm"
          label="Xác nhận mật khẩu"
          value={signupConfirm}
          onChange={setSignupConfirm}
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
        />
        <div className="check-list">
          <Rule
            valid={fullName.trim().length >= 1 && fullName.trim().length <= 100}
          >
            Họ và tên từ 1 đến 100 ký tự
          </Rule>
          <Rule
            valid={signupPassword.length >= 8 && signupPassword.length <= 72}
          >
            Mật khẩu từ 8 đến 72 ký tự
          </Rule>
          <Rule
            valid={signupConfirm.length > 0 && signupConfirm === signupPassword}
          >
            Mật khẩu xác nhận trùng khớp
          </Rule>
        </div>
        <button type="submit" className="primary">
          Tiếp tục xác thực email →
        </button>
      </form>
      <p className="muted-center">
        Đã có tài khoản?{' '}
        <button type="button" onClick={() => navigate('signin')}>
          Đăng nhập
        </button>
      </p>
    </section>
  )
}
