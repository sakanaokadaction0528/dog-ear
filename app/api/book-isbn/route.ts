import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const isbn = req.nextUrl.searchParams.get('isbn')
  if (!isbn) return NextResponse.json({ error: 'isbn required' }, { status: 400 })

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  const keyParam = apiKey ? `&key=${apiKey}` : ''
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1${keyParam}`

  try {
    const res = await fetch(url, {
      headers: apiKey ? { Referer: 'https://dog-ear-lime.vercel.app' } : {},
      cache: 'no-store',
    })
    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return NextResponse.json({ found: false })

    const v = item.volumeInfo ?? {}
    const thumbnail = v.imageLinks?.thumbnail?.replace('http://', 'https://') ?? null

    return NextResponse.json({
      found: true,
      title: v.title ?? '',
      author: (v.authors ?? []).join(', '),
      cover_url: thumbnail,
    })
  } catch (e) {
    console.error('[book-isbn]', e)
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
