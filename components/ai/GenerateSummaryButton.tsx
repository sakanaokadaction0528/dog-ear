'use client'

import { Button } from '@/components/ui/button'

interface GenerateSummaryButtonProps {
  onGenerate: () => Promise<void>
  generating: boolean
  error: string | null
  hasNotes: boolean
}

export function GenerateSummaryButton({
  onGenerate,
  generating,
  error,
  hasNotes,
}: GenerateSummaryButtonProps) {
  return (
    <div className="space-y-2">
      <Button
        onClick={onGenerate}
        disabled={generating || !hasNotes}
        className="w-full"
        variant={hasNotes ? 'default' : 'secondary'}
      >
        {generating ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            AI分析中...
          </span>
        ) : (
          '✨ AI要約を生成'
        )}
      </Button>
      {!hasNotes && (
        <p className="text-xs text-muted-foreground text-center">
          読書メモを追加してからAI要約を生成できます
        </p>
      )}
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  )
}
