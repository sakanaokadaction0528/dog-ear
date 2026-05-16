'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Plus, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/dashboard', icon: Home,        label: 'ホーム' },
  { href: '/books',     icon: BookOpen,    label: '本棚' },
  { href: '/books/new', icon: Plus,        label: '追加', isAction: true },
  { href: '/actions',   icon: CheckSquare, label: 'タスク' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border
                    flex items-center justify-around h-16 pb-safe md:hidden z-50">
      {navItems.map(({ href, icon: Icon, label, isAction }) => {
        const active =
          pathname === href ||
          (href !== '/books/new' && pathname.startsWith(href + '/'))

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors',
              isAction && 'bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl shadow-sm',
              !isAction && active && 'text-primary',
              !isAction && !active && 'text-muted-foreground'
            )}
          >
            <Icon size={isAction ? 22 : 20} strokeWidth={isAction ? 2.5 : 1.8} />
            {!isAction && (
              <span className="text-[10px] font-medium leading-none">{label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
