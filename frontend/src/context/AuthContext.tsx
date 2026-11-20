import { createContext, useContext, type ReactNode } from 'react'
import { useEduQuizAuth } from '../hooks/useEduQuizAuth'

type AuthValue = ReturnType<typeof useEduQuizAuth>
const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useEduQuizAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be called inside AuthProvider')
  return auth
}
