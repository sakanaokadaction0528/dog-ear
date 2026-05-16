import OpenAI from 'openai'
import type { LLMProvider } from './provider'
import type { AISummaryContent, ReadingNote } from '@/lib/types/app.types'

// Lazy initialization — avoids build-time error when env var is not set
function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

function buildPrompt(
  title: string,
  author: string,
  purpose: string | null,
  notes: ReadingNote[]
): string {
  const notesText = notes
    .map(
      (n, i) => `
## メモ ${i + 1}（${n.read_date}、重要度: ${n.importance}/5）
読んだ範囲: ${n.read_range ?? '未記入'}
印象に残った文章: ${n.quote ?? '-'}
内容メモ: ${n.memo ?? '-'}
気づき: ${n.insight ?? '-'}
今の自分との関連: ${n.personal_relevance ?? '-'}
行動に移せること: ${n.action_idea ?? '-'}
`.trim()
    )
    .join('\n\n')

  return `あなたは読書コーチです。以下の読書メモを分析し、ユーザーが「この本を今の人生・仕事・副業・投資・発信にどう活かすか」を重視した回答をJSONで返してください。

書籍: 「${title}」著者: ${author}
読書目的: ${purpose ?? '一般的な学習'}

読書メモ:
${notesText}

以下のJSON構造で返してください（日本語で）:
{
  "summary": "本全体の要約（2〜3文）",
  "key_lessons": ["重要ポイント1", "重要ポイント2", ...],
  "personal_insights": ["学び・気づき1", "気づき2", ...],
  "action_items": [
    {
      "title": "行動タイトル",
      "description": "詳細説明",
      "category": "today | this_week | long_term | work | side_hustle | publish",
      "priority": "high | medium | low",
      "due_date": "YYYY-MM-DDまたは空文字"
    }
  ],
  "content_ideas": {
    "note": ["note記事ネタ1", ...],
    "youtube": ["YouTubeネタ1", ...]
  }
}

マークダウンなしの純粋なJSONのみ返してください。`
}

export class OpenAIProvider implements LLMProvider {
  async generateBookSummary(
    title: string,
    author: string,
    purpose: string | null,
    notes: ReadingNote[]
  ): Promise<AISummaryContent> {
    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: buildPrompt(title, author, purpose, notes) }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const raw = response.choices[0].message.content
    if (!raw) throw new Error('OpenAI returned empty response')

    return JSON.parse(raw) as AISummaryContent
  }
}
