import { BookOpen, Star, Lightbulb, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AISummaryContent } from '@/lib/types/app.types'

interface AISummaryCardProps {
  content: AISummaryContent
  generatedAt?: string
}

export function AISummaryCard({ content, generatedAt }: AISummaryCardProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen size={15} className="text-primary" />
            本全体の要約
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">{content.summary}</p>
        </CardContent>
      </Card>

      {/* Key Lessons */}
      {content.key_lessons?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Star size={15} className="text-primary" />
              重要ポイント・学び
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.key_lessons.map((lesson, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                  <span className="text-foreground leading-relaxed">{lesson}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Personal Insights */}
      {content.personal_insights?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb size={15} className="text-primary" />
              気づき・インサイト
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.personal_insights.map((insight, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-accent shrink-0">—</span>
                  <span className="text-foreground leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {content.action_items?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap size={15} className="text-primary" />
              AI提案アクション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {content.action_items.map((item, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                      {item.category}
                    </span>
                    <span className="text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">
                      優先度: {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {generatedAt && (
        <p className="text-xs text-muted-foreground text-right">
          生成日時: {new Date(generatedAt).toLocaleString('ja-JP')}
        </p>
      )}
    </div>
  )
}
