'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface TopBarProps {
  title: string
  showBack?: boolean
  rightAction?: React.ReactNode
  className?: string
}

export function TopBar({ title, showBack = false, rightAction, className }: TopBarProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between',
        'bg-background/80 backdrop-blur-sm border-b border-border',
        'px-4 py-3 min-h-[56px]',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-8 w-8 text-muted-foreground mr-1"
            onClick={() => router.back()}
          >
            ←
          </Button>
        )}
        <h2 className="font-semibold text-foreground text-base leading-tight">{title}</h2>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  )
}
