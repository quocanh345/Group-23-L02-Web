import { useState } from 'react'

export default function PasswordField({ id, label, value, onChange, placeholder, autoComplete }: {
  id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string; autoComplete: string
}) {
  const [visible, setVisible] = useState(false)
  return <div className="field">
    <label htmlFor={id}>{label}</label>
    <div className="input-wrap">
      <input id={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} required />
      <button type="button" className="eye" onClick={() => setVisible(!visible)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{visible ? 'Ẩn' : 'Hiện'}</button>
    </div>
  </div>
}

