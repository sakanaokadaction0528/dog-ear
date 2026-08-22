import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next.js 16: export must be named "proxy" (replaces middleware.ts)
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッション Cookie をリフレッシュ＋認証チェック
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  // PREVIEW_MODE=1 の場合はリダイレクトをスキップ（UI プレビュー用）
  if (process.env.PREVIEW_MODE !== '1') {
    // 未認証 → /login へリダイレクト
    if (!user && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin))
    }
    // 認証済みでログインページにいる → /dashboard へ
    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // 静的アセット・画像・マニフェスト・SW はスキップ
    '/((?!_next/static|_next/image|favicon\\.ico|icon.*\\.png|manifest\\.json|sw\\.js).*)',
  ],
}
