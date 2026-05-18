import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ items: [] })

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  if (!apiKey) {
    console.error('[book-covers] GOOGLE_BOOKS_API_KEY is not set')
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&key=${apiKey}`

  let data: { items?: unknown[]; error?: { code: number; message: string } }
  try {
    const res = await fetch(url, {
      headers: { Referer: 'https://dog-ear-lime.vercel.app' },
      cache: 'no-store',
    })
    data = await res.json()
  } catch (e) {
    console.error('[book-covers] fetch failed:', e)
    return NextResponse.json({ items: [] })
  }

  if (data.error) {
    console.error('[book-covers] API error:', data.error.code, data.error.message)
    return NextResponse.json({ items: [], apiError: data.error.message }, { status: data.error.code === 403 ? 403 : 200 })
  }

  const items = (data.items ?? [])
    .filter((item: unknown) => {
      const v = (item as { volumeInfo?: { imageLinks?: { thumbnail?: string } } }).volumeInfo
      return v?.imageLinks?.thumbnail
    })
    .map((item: unknown) => {
      const v = (item as { volumeInfo: { imageLinks: { thumbnail: string } } }).volumeInfo
      return { thumbnail: v.imageLinks.thumbnail.replace('http://', 'https://') }
    })

  console.log(`[book-covers] q="${q}" → ${items.length} covers found`)
  return NextResponse.json({ items })
}
