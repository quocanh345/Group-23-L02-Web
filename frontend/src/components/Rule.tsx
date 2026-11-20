import type { ReactNode } from 'react'
export default function Rule({ valid, children }: { valid: boolean; children: ReactNode }) {
  return <div className={`rule${valid ? ' ok' : ''}`}>
    <span className="mark">{valid ? '✓' : '○'}
    </span> {children}
  </div>
}
