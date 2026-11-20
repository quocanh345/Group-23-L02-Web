export type Screen = 'signin' | 'signup' | 'forgot' | 'otp' | 'reset' | 'success' | 'dashboard'

// Demo only: credentials and OTP must be handled by a backend in production.
export type Account = { username: string; email: string; password: string }
export type Pending = {
  mode: 'signup' | 'forgot'
  email: string
  username: string
  password: string
  otp: string
  expiresAt: number
  lastSentAt: number
  attempts: number
  verified: boolean
}
