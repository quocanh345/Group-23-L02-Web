import { AuthProvider, useAuth } from './context/AuthContext'
import Hero from './components/Hero'
import SigninPage from './pages/SigninPage'
import SignupPage from './pages/SignupPage'
import ForgotPage from './pages/ForgotPage'
import OtpPage from './pages/OtpPage'
import ResetPage from './pages/ResetPage'
import SuccessPage from './pages/SuccessPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'

function AuthLayout() {
  const { screen, alert, navigate } = useAuth()
  return (
    <div className="layout">
      <Hero />
      <main className="main">
        <div className="auth-card">
          {(screen === 'signin' || screen === 'signup') && (
            <div className="top-note">
              {screen === 'signin' ? (
                <>Bạn chưa có tài khoản? <button type="button" onClick={() => navigate('signup')}>Đăng ký ngay</button></>
              ) : (
                <>Bạn đã có tài khoản? <button type="button" onClick={() => navigate('signin')}>Đăng nhập</button></>
              )}
            </div>
          )}
          {alert && <div className={`alert show${alert.success ? ' success' : ''}`} role="alert" aria-live="polite">{alert.text}</div>}
          {screen === 'signin' && <SigninPage />}
          {screen === 'signup' && <SignupPage />}
          {screen === 'forgot' && <ForgotPage />}
          {screen === 'otp' && <OtpPage />}
          {screen === 'reset' && <ResetPage />}
          {screen === 'success' && <SuccessPage />}
          {screen === 'dashboard' && <DashboardPage />}
          <div className="footer-mobile">© 2026 EduQuiz · Bản thử nghiệm giao diện</div>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return <AuthProvider><AuthLayout /></AuthProvider>
}
