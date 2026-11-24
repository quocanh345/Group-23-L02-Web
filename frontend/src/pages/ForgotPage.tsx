import { useAuth } from '../context/AuthContext'

export default function ForgotPage() {
  const { forgot, forgotEmail, setForgotEmail, navigate } = useAuth()
  return (
    <section className="screen"><button type="button" className="back" onClick={() => navigate('signin')}>← Quay lại đăng nhập</button><p className="kicker">KHÔI PHỤC TÀI KHOẢN</p><h2>Quên mật khẩu?</h2><p className="sub">Nhập email tài khoản. Chúng tôi sẽ hướng dẫn bạn xác minh để đặt lại mật khẩu.</p>
        <form onSubmit={forgot} noValidate><div className="field"><label htmlFor="forgotEmail">Email của bạn</label><input id="forgotEmail" type="email" autoComplete="email" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required /></div><button className="primary" type="submit">Tiếp tục →</button></form>
        <p className="info">Trong bản demo, mã OTP sẽ hiện ngay trên màn hình thay vì gửi email.</p>
      </section>
  )
}
