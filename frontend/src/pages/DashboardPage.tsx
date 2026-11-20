import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { welcomeName, setLoginPassword, navigate } = useAuth()
  return (
    <section className="screen">
      <p className="kicker">EDUQUIZ / TRANG CHỦ</p>
      <h2>Chào mừng, {welcomeName} 👋</h2>
      <p className="sub">Đăng nhập thành công! Đây là giao diện Dashboard minh họa theo Blueprint.</p>
      <div className="dashboard">
        <h3>Không gian học tập của bạn</h3>
        <div className="dash-action">
          <b>📚</b> Tạo đề mới từ PDF hoặc văn bản
        </div>
        <div className="dash-action">
          <b>🧠</b> Làm bài trắc nghiệm tương tác
        </div>
        <div className="dash-action">
          <b>📊</b> Theo dõi tiến độ học tập
        </div>
      </div>
      <button type="button" className="secondary" onClick={() => { setLoginPassword(''); navigate('signin') }}>
        Đăng xuất
      </button>
    </section>
  )
}
