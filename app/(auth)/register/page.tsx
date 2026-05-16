'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      // If email confirmation is disabled in Supabase, redirect immediately
      const { data } = await supabase.auth.getUser()
      if (data.user?.confirmed_at) {
        router.push('/dashboard')
      } else {
        setDone(true)
      }
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Card className="shadow-sm border-border text-center p-6">
        <div className="text-3xl mb-3">📬</div>
        <h2 className="font-semibold text-foreground mb-1">確認メールを送信しました</h2>
        <p className="text-sm text-muted-foreground">
          メールのリンクをクリックしてアカウントを有効化してください。
        </p>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center">新規登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">パスワード（6文字以上）</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登録中...' : 'アカウントを作成'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-primary underline underline-offset-2">
            ログイン
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
