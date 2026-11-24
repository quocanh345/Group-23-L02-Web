export type Screen =
  'signin' | 'signup' | 'forgot' | 'otp' | 'reset' | 'success' | 'dashboard'

// Demo only: credentials and OTP must be handled by a backend in production.
export type Account = { fullName: string; email: string; password: string }
export type Pending = {
  mode: 'signup' | 'forgot'
  email: string
  fullName: string
  password: string
  otp: string
  expiresAt: number
  lastSentAt: number
  attempts: number
  verified: boolean
}
