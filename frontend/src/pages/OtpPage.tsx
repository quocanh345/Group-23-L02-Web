import { useAuth } from '../context/AuthContext'

export default function OtpPage() {
  const { pending, otpDigits, otpRefs, writeOTP, otpKeyDown, pasteOTP, verifyOTP, formattedTime, resendRemaining, resendOTP, navigate } = useAuth()
  return (
    <section className="screen"><button type="button" className="back" onClick={() => navigate(pending?.mode === 'forgot' ? 'forgot' : 'signup')}>← Quay lại</button><p className="kicker">BẢO MẬT TÀI KHOẢN</p><h2>Xác thực email</h2><p className="sub">Nhập mã xác thực 6 chữ số cho <strong>{pending?.email}</strong></p>
        <div className="demo-note">🧪 <b>Chế độ giao diện thử nghiệm</b><br />OTP giả lập của bạn: <strong>{pending?.otp}</strong><br />Không có email thật nào được gửi.</div>
        <form onSubmit={verifyOTP}><div className="otp-boxes" role="group" aria-label="Mã OTP gồm 6 chữ số">{otpDigits.map((digit, index) => <input key={index} ref={element => { otpRefs.current[index] = element }} aria-label={`Số ${index + 1}`} inputMode="numeric" maxLength={6} autoComplete={index === 0 ? 'one-time-code' : 'off'} value={digit} onChange={e => writeOTP(index, e.target.value)} onKeyDown={e => otpKeyDown(index, e)} onPaste={pasteOTP} />)}</div>
          <p className="timer">Mã hết hạn sau <strong>{formattedTime}</strong></p><button type="submit" className="primary">Xác thực mã OTP →</button>
        </form><p className="muted-center">Chưa nhận được mã? <button type="button" disabled={resendRemaining > 0} onClick={resendOTP}>{resendRemaining ? `Gửi lại (${resendRemaining}s)` : 'Gửi lại OTP'}</button></p>
      </section>
  )
}
