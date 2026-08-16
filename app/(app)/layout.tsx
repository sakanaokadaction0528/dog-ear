'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AuthProvider, useAuthContext } from '@/lib/context/AuthContext'

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, user, router])

  // 認証確認中は軽量なローディング画面
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 animate-pulse" />
          <div className="h-2 w-20 rounded bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  // 未認証 → リダイレクト中（空表示）
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 animate-in fade-in duration-150">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
