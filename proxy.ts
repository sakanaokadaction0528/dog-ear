import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next.js 16: export must be named "proxy" (replaces middleware.ts)
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // セッション Cookie のリフレッシュのみを行う（認証リダイレクトはクライアント側で処理）
  // これにより各ページロードの遅延を最小化する
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

  // Cookie のリフレッシュのために呼ぶ
  const { data: { session } } = await supabase.auth.getSession()

  // ログイン済みユーザーが /login や /register を開いた場合だけリダイレクト
  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  if (session?.user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // 静的アセット・画像・マニフェストはスキップ（高速化）
    '/((?!_next/static|_next/image|favicon\\.ico|icon.*\\.png|manifest\\.json|sw\\.js).*)',
  ],
}
