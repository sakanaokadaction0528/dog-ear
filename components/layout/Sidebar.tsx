'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, CheckSquare, Rss, Send } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard',  icon: Home,        label: 'ダッシュボード' },
  { href: '/books',      icon: BookOpen,    label: '本棚' },
  { href: '/actions',    icon: CheckSquare, label: '行動リスト' },
  { href: '/posts/new',  icon: Send,        label: '投稿' },
  { href: '/feed',       icon: Rss,         label: 'フィード' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-card border-r border-border px-3 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <Image src="/icon-192.png" alt="Dog Ear" width={28} height={28} className="rounded-md" />
        <div>
          <h1 className="font-bold text-foreground text-lg leading-none">Dog Ear</h1>
          <p className="text-xs text-muted-foreground">読書を、行動に変える</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href ||
            (href !== '/posts/new' && pathname.startsWith(href + '/'))

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
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
