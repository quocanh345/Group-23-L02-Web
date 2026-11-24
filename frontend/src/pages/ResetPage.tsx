import { useAuth } from '../context/AuthContext'
import PasswordField from '../components/PasswordField'

export default function ResetPage() {
  const { reset, resetPassword, setResetPassword, resetConfirm, setResetConfirm } = useAuth()
  return (
    <section className="screen"><p className="kicker">KHÔI PHỤC TÀI KHOẢN</p><h2>Đặt mật khẩu mới</h2><p className="sub">Xác thực thành công. Hãy tạo một mật khẩu mới cho tài khoản của bạn.</p>
        <form onSubmit={reset} noValidate><PasswordField id="resetPassword" label="Mật khẩu mới" value={resetPassword} onChange={setResetPassword} placeholder="Từ 8 đến 72 ký tự" autoComplete="new-password" /><PasswordField id="resetConfirm" label="Xác nhận mật khẩu mới" value={resetConfirm} onChange={setResetConfirm} placeholder="Nhập lại mật khẩu" autoComplete="new-password" /><button type="submit" className="primary">Lưu mật khẩu mới →</button></form>
      </section>
  )
}
