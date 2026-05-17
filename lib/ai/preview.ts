import type { LLMProvider } from './provider'
import type { AISummaryContent, ReadingNote } from '@/lib/types/app.types'

// Preview mode mock — generates a plausible summary from actual note content
// without calling any external API.
export class PreviewLLMProvider implements LLMProvider {
  async generateBookSummary(
    title: string,
    author: string,
    purpose: string | null,
    notes: ReadingNote[]
  ): Promise<AISummaryContent> {
    const memos    = notes.map((n) => n.memo).filter(Boolean) as string[]
    const insights = notes.map((n) => n.insight).filter(Boolean) as string[]
    const actions  = notes.map((n) => n.action_idea).filter(Boolean) as string[]
    const quotes   = notes.map((n) => n.quote).filter(Boolean) as string[]
    const highImportance = notes.filter((n) => n.importance >= 4)

    const summary =
      `「${title}」（${author}）の読書メモ ${notes.length} 件を分析しました。` +
      (purpose ? `読書目的「${purpose}」を踏まえ、` : '') +
      (memos[0] ? `特に「${memos[0].slice(0, 40)}…」という記録が印象的です。` : 'メモの内容から重要なポイントを抽出しました。') +
      '実生活・仕事への応用可能な学びが複数含まれています。'

    const key_lessons: string[] = [
      ...(quotes.slice(0, 2).map((q) => `"${q.slice(0, 60)}${q.length > 60 ? '…' : ''}" という記述から学べること`)),
      ...(highImportance.slice(0, 2).map((n) => n.memo ?? n.insight ?? '重要度の高いメモからの学び')).filter(Boolean),
      `${author} の主張の核心: ${memos[0]?.slice(0, 50) ?? '読書メモを蓄積することで具体的な学びが抽出されます'}`,
    ].slice(0, 4)

    const personal_insights: string[] = [
      ...(insights.slice(0, 3)),
      insights.length === 0 ? 'メモの「気づき」欄を記入すると、よりパーソナルなインサイトが生成されます。' : '',
    ].filter(Boolean).slice(0, 3)

    const action_items: AISummaryContent['action_items'] = [
      ...(actions.slice(0, 2).map((a, i) => ({
        title: a.slice(0, 40),
        description: a.length > 40 ? a.slice(40, 100) : '',
        category: (i === 0 ? 'this_week' : 'long_term') as AISummaryContent['action_items'][number]['category'],
        priority: 'high' as const,
        due_date: '',
      }))),
      {
        title: `「${title}」の内容を誰かにアウトプットする`,
        description: '読んだ内容を人に話すことで理解が定着します。',
        category: 'this_week' as const,
        priority: 'medium' as const,
        due_date: '',
      },
    ].slice(0, 3)

    const content_ideas: AISummaryContent['content_ideas'] = {
      note: [
        `「${title}」から学んだ3つのこと`,
        `${author} の考え方が変えた私の視点`,
      ],
      youtube: [
        `【書評】${title} — ${purpose ?? '実践的な学び'} の観点から`,
        `${author} の教えを仕事に活かす方法`,
      ],
    }

    return { summary, key_lessons, personal_insights, action_items, content_ideas }
  }
}
