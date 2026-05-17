'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, CheckSquare, Rss, Send } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/dashboard',  icon: Home,        label: 'ホーム' },
  { href: '/books',      icon: BookOpen,    label: '本棚' },
  { href: '/actions',    icon: CheckSquare, label: 'タスク' },
  { href: '/posts/new',  icon: Send,        label: '投稿' },
  { href: '/feed',       icon: Rss,         label: 'フィード' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border
                    flex items-center justify-around h-16 pb-safe md:hidden z-50">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active =
          pathname === href ||
          (href !== '/posts/new' && pathname.startsWith(href + '/'))

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
