import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

// All app routes require authentication — never statically pre-render
export const dynamic = 'force-dynamic'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
