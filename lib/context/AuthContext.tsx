'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { migrateGuestData } from '@/lib/utils/migrateGuestData'

type AuthContextType = {
  user: User | null
  isGuest: boolean
  authLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: true,
  authLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    // 3秒以内に getSession が解決しない場合は未認証として扱う（ハング防止）
    const timeout = setTimeout(() => setAuthLoading(false), 3000)

    // getSession は Cookie を読むだけなので基本即時。
    // トークンリフレッシュが必要な場合のみ少し時間がかかる。
    supabase.auth.getSession()
      .then(({ data }) => {
        setUser(data.session?.user ?? null)
        setAuthLoading(false)
      })
      .catch(() => {
        // ネットワークエラー等でも authLoading を解除する
        setAuthLoading(false)
      })
      .finally(() => clearTimeout(timeout))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
      if (_event === 'SIGNED_IN' && session?.user) {
        migrateGuestData(session.user.id, supabase).catch(() => {})
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/dashboard'
  }

  return (
    <AuthContext.Provider value={{ user, isGuest: !user, authLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
