'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'ダッシュボード' },
  { href: '/books',     icon: '📚', label: '本棚' },
  { href: '/books/new', icon: '＋', label: '本を追加' },
  { href: '/actions',   icon: '✓',  label: '行動リスト' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-card border-r border-border px-3 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <span className="text-2xl">📖</span>
        <div>
          <h1 className="font-bold text-foreground text-lg leading-none">Dog Ear</h1>
          <p className="text-xs text-muted-foreground">読書を、行動に変える</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/books/new' && pathname.startsWith(item.href + '/'))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User / Sign out */}
      {user && (
        <div className="border-t border-border pt-4 mt-4">
          <p className="text-xs text-muted-foreground px-3 mb-2 truncate">{user.email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground text-xs"
            onClick={signOut}
          >
            ログアウト
          </Button>
        </div>
      )}
    </aside>
  )
}
