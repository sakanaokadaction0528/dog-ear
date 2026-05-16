# 📖 Dog Ear

> 本の端を折るように、心に残ったページを記録する

**Dog Ear** は AI を活用した読書メモ・要約・行動提案アプリです。
読書内容を整理し、学びを抽出し、行動に変換し、人生・仕事・副業・発信へ活かすことを目的としています。

---

## ✨ 主な機能

- 📚 **本の管理** — タイトル・著者・カテゴリ・読書目的・ステータスを記録
- 📝 **読書メモ** — 引用・気づき・行動アイデアを1冊に複数記録可能
- ✨ **AI要約** — OpenAI GPT-4o-miniが読書メモを分析し、要約・学び・行動リスト・発信ネタを生成
- ✓ **行動リスト** — AIが自動生成 + 手動でも追加可能。カテゴリ別に管理
- 🏠 **ダッシュボード** — 読書状況・今日のタスク・統計を一覧表示

---

## 🛠 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript (strict) |
| スタイリング | Tailwind CSS v4 |
| UIコンポーネント | shadcn/ui |
| バックエンド | Supabase (認証 + PostgreSQL) |
| AI | OpenAI API (GPT-4o-mini) |
| 状態管理 | Zustand |
| フォーム | React Hook Form + Zod |

---

## 🚀 セットアップ方法

### 1. 依存関係をインストール

```bash
npm install
```

### 2. 環境変数を設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集し、各値を入力してください：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
```

### 3. Supabase設定

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. **SQL Editor** を開く
3. `supabase/schema.sql` の内容を貼り付けて実行
4. `supabase/rls.sql` の内容を貼り付けて実行
5. **Authentication > Email** で「Confirm email」を任意に設定（開発時はOFFが便利）

### 4. OpenAI APIキーを取得

1. [OpenAI Platform](https://platform.openai.com/api-keys) でAPIキーを作成
2. `.env.local` の `OPENAI_API_KEY` に設定

### 5. 起動

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
