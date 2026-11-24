import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react'
import type { Screen, Account, Pending } from '../types/auth'
import { emailRegex, normalizeEmail, randomOTP } from '../utils/auth'

/** UI-only auth flow. Replace this hook's demo storage with API calls for production. */
export function useEduQuizAuth() {
  const [screen, setScreen] = useState<Screen>('signin')
  const [alert, setAlert] = useState<{ text: string; success: boolean } | null>(
    null,
  )
  // Demo only: no real authentication, server, database, or email sending.
  // Passwords are only held in memory for this UI prototype. Never use this in production.
  const accounts = useRef<Account[]>([])
  const [pending, setPending] = useState<Pending | null>(null)
  const [now, setNow] = useState(Date.now())
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''))
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [successTitle, setSuccessTitle] = useState('Hoàn tất!')
  const [successDescription, setSuccessDescription] = useState('')
  const [welcomeName, setWelcomeName] = useState('')

  const navigate = (to: Screen) => {
    setAlert(null)
    setScreen(to)
  }
  const message = (text: string, success = false) => setAlert({ text, success })
  const uniqueEmail = (address: string) =>
    !accounts.current.some((a) => a.email === address)

  useEffect(() => {
    if (screen !== 'otp') return
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [screen])
  useEffect(() => {
    if (screen === 'otp') otpRefs.current[0]?.focus()
  }, [screen, pending?.lastSentAt])

  const beginOTP = (
    mode: 'signup' | 'forgot',
    address: string,
    name = '',
    password = '',
  ) => {
    const time = Date.now()
    setPending({
      mode,
      email: address,
      fullName: name,
      password,
      otp: randomOTP(),
      expiresAt: time + 300000,
      lastSentAt: time,
      attempts: 0,
      verified: false,
    })
    setOtpDigits(Array(6).fill(''))
    navigate('otp')
  }
  const signup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = fullName.trim(),
      address = normalizeEmail(email)
    if (name.length < 1 || name.length > 100)
      return message('Họ và tên phải có từ 1 đến 100 ký tự.')
    if (!emailRegex.test(address)) return message('Email không đúng định dạng.')
    if (signupPassword.length < 8 || signupPassword.length > 72)
      return message('Mật khẩu phải có từ 8 đến 72 ký tự.')
    if (signupPassword !== signupConfirm)
      return message('Mật khẩu xác nhận không trùng khớp.')
    if (!uniqueEmail(address))
      return message('Email đã được đăng ký trong phiên demo này.')
    beginOTP('signup', address, name, signupPassword)
  }
  const signin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = normalizeEmail(loginEmail)
    if (!emailRegex.test(address))
      return message('Vui lòng nhập địa chỉ email hợp lệ.')
    if (loginPassword.length < 8 || loginPassword.length > 72)
      return message('Mật khẩu phải có từ 8 đến 72 ký tự.')
    const found = accounts.current.find(
      (a) => a.email === address && a.password === loginPassword,
    )
    if (!found)
      return message(
        'Email hoặc mật khẩu không chính xác. Hãy đăng ký thử một tài khoản trước nhé.',
      )
    setWelcomeName(found.fullName)
    navigate('dashboard')
  }
  const forgot = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = normalizeEmail(forgotEmail)
    if (!emailRegex.test(address)) return message('Vui lòng nhập email hợp lệ.')
    if (!accounts.current.some((a) => a.email === address))
      return message(
        'Email này chưa có tài khoản trong phiên demo. Hãy đăng ký trước.',
      )
    beginOTP('forgot', address)
  }
  const writeOTP = (index: number, input: string) => {
    const digits = input.replace(/\D/g, '')
    const values = [...otpDigits]
    if (digits.length > 1)
      digits
        .slice(0, 6 - index)
        .split('')
        .forEach((char, offset) => {
          values[index + offset] = char
        })
    else values[index] = digits
    setOtpDigits(values)
    if (digits) otpRefs.current[Math.min(5, index + digits.length)]?.focus()
  }
  const otpKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const values = [...otpDigits]
      values[index - 1] = ''
      setOtpDigits(values)
      otpRefs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0)
      otpRefs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < 5)
      otpRefs.current[index + 1]?.focus()
  }
  const pasteOTP = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const code = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    setOtpDigits(Array.from({ length: 6 }, (_, i) => code[i] || ''))
    otpRefs.current[Math.min(5, code.length)]?.focus()
  }
  const verifyOTP = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pending) return message('Vui lòng bắt đầu lại.')
    if (Date.now() >= pending.expiresAt)
      return message('OTP đã hết hạn. Hãy gửi lại mã mới.')
    if (pending.attempts >= 5)
      return message('Bạn đã nhập sai 5 lần. Hãy gửi mã OTP mới.')
    const code = otpDigits.join('')
    if (!/^\d{6}$/.test(code)) return message('Vui lòng điền đủ 6 chữ số OTP.')
    if (code !== pending.otp) {
      setPending({ ...pending, attempts: pending.attempts + 1 })
      return message(
        `OTP không chính xác. Bạn còn ${4 - pending.attempts} lần thử.`,
      )
    }
    if (pending.mode === 'signup') {
      if (!uniqueEmail(pending.email)) return message('Email đã được đăng ký.')
      accounts.current.push({
        fullName: pending.fullName,
        email: pending.email,
        password: pending.password,
      })
      setSuccessTitle('Tạo tài khoản thành công!')
      setSuccessDescription(
        'Email đã được xác thực trong bản demo. Bạn có thể đăng nhập bằng email đã đăng ký.',
      )
      setLoginEmail(pending.email)
      setLoginPassword('')
      setPending(null)
      navigate('success')
    } else {
      setPending({ ...pending, verified: true })
      navigate('reset')
    }
  }
  const resendOTP = () => {
    if (!pending) return
    if (Date.now() - pending.lastSentAt < 60000)
      return message('Vui lòng chờ 60 giây trước khi gửi lại OTP.')
    const time = Date.now()
    setPending({
      ...pending,
      otp: randomOTP(),
      expiresAt: time + 300000,
      lastSentAt: time,
      attempts: 0,
    })
    setOtpDigits(Array(6).fill(''))
    message('Đã tạo OTP mới (giả lập).', true)
  }
  const reset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pending || pending.mode !== 'forgot' || !pending.verified)
      return message('Bạn cần xác minh email trước.')
    if (resetPassword.length < 8 || resetPassword.length > 72)
      return message('Mật khẩu mới phải có từ 8 đến 72 ký tự.')
    if (resetPassword !== resetConfirm)
      return message('Mật khẩu xác nhận không trùng khớp.')
    const account = accounts.current.find((a) => a.email === pending.email)
    if (!account) return message('Không tìm thấy tài khoản.')
    account.password = resetPassword
    setLoginEmail(account.email)
    setLoginPassword('')
    setPending(null)
    setSuccessTitle('Đổi mật khẩu thành công!')
    setSuccessDescription(
      'Mật khẩu đã được đổi trong phiên demo. Hãy đăng nhập lại bằng mật khẩu mới.',
    )
    navigate('success')
  }
  const remaining = pending
    ? Math.max(0, Math.ceil((pending.expiresAt - now) / 1000))
    : 0
  const resendRemaining = pending
    ? Math.max(0, Math.ceil((pending.lastSentAt + 60000 - now) / 1000))
    : 0
  const formattedTime = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
  return {
    screen,
    alert,
    pending,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    fullName,
    setFullName,
    email,
    setEmail,
    signupPassword,
    setSignupPassword,
    signupConfirm,
    setSignupConfirm,
    forgotEmail,
    setForgotEmail,
    resetPassword,
    setResetPassword,
    resetConfirm,
    setResetConfirm,
    otpDigits,
    otpRefs,
    successTitle,
    successDescription,
    welcomeName,
    navigate,
    signup,
    signin,
    forgot,
    writeOTP,
    otpKeyDown,
    pasteOTP,
    verifyOTP,
    resendOTP,
    reset,
    resendRemaining,
    formattedTime,
    message,
  }
}
