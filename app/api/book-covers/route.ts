import { NextRequest, NextResponse } from 'next/server'

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, {
      headers: { Referer: 'https://dog-ear-lime.vercel.app' },
      cache: 'no-store',
    })
    if (res.ok || i === retries) return res
    await new Promise(r => setTimeout(r, 500 * (i + 1)))
  }
  throw new Error('fetch failed after retries')
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ items: [] })

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  if (!apiKey) {
    console.error('[book-covers] GOOGLE_BOOKS_API_KEY is not set')
    return NextResponse.json({ items: [] })
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&key=${apiKey}`

  let data: { items?: unknown[]; error?: { code: number; message: string } }
  try {
    const res = await fetchWithRetry(url)
    data = await res.json()
  } catch (e) {
    console.error('[book-covers] fetch failed:', e)
    return NextResponse.json({ items: [] })
  }

  if (data.error) {
    console.error('[book-covers] API error:', data.error.code, data.error.message)
    return NextResponse.json({ items: [] })
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
