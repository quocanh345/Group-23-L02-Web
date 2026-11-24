import { useAuth } from '../context/AuthContext'

export default function SuccessPage() {
  const { successTitle, successDescription, navigate } = useAuth()
  return (
    <section className="screen"><div className="icon-big">✓</div><p className="kicker">THÀNH CÔNG</p><h2>{successTitle}</h2><p className="sub">{successDescription}</p><button className="primary" type="button" onClick={() => navigate('signin')}>Đến trang đăng nhập →</button></section>
  )
}
