export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const normalizeEmail = (value: string) => value.trim().toLowerCase()

// For demonstration purposes only: this OTP is never sent to an actual email.
export function randomOTP(): string {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return (values[0] % 1000000).toString().padStart(6, '0')
}
