import type { LLMProvider } from './provider'
import type { AISummaryContent, ReadingNote } from '@/lib/types/app.types'

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

  return `あなたは読書コーチです。以下の読書メモを分析し、ユーザーが「この本の学びを今日から実生活・仕事・人生に具体的に活かす」ための回答をJSONで返してください。

書籍: 「${title}」著者: ${author}
読書目的: ${purpose ?? '一般的な学習'}

読書メモ:
${notesText}

以下のJSON構造で返してください（日本語で）:
{
  "summary": "本全体の要約（2〜3文）",
  "key_lessons": ["重要ポイント1", "重要ポイント2", ...],
  "personal_insights": ["このユーザーのメモから読み取れる個人的な気づき1", "気づき2", ...],
  "action_items": [
    {
      "title": "具体的な行動タイトル（例：「時間をお金で買えることを1つ検討する」「朝30分だけ読書時間を確保する」など、本のテーマに沿った実行可能な行動）",
      "description": "なぜこの行動が有効か、どう実行するかの具体的な説明",
      "category": "today | this_week | long_term | work | side_hustle | publish",
      "priority": "high | medium | low",
      "due_date": "YYYY-MM-DDまたは空文字"
    }
  ]
}

【アクションアイテムのルール】
- 「本を人に薦める」「感想をシェアする」などの発信行動は含めない
- 本の内容から直接導かれる、生活・思考・習慣・仕事への具体的な変化を書く
- 抽象的にならず、誰でも明日から実行できるレベルに落とし込む
- 3〜5個生成する

マークダウンなしの純粋なJSONのみ返してください。`
}

export class GeminiProvider implements LLMProvider {
  async generateBookSummary(
    title: string,
    author: string,
    purpose: string | null,
    notes: ReadingNote[]
  ): Promise<AISummaryContent> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(title, author, purpose, notes) }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Gemini API error: ${res.status} ${err}`)
    }

    const data = await res.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) throw new Error('Gemini returned empty response')

    return JSON.parse(raw) as AISummaryContent
  }
}
