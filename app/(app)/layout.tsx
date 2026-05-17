import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AuthProvider } from '@/lib/context/AuthContext'

// All app routes require authentication — never statically pre-render
export const dynamic = 'force-dynamic'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 animate-in fade-in duration-150">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  )
}
