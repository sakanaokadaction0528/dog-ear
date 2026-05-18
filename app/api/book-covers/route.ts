import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ items: [] })

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&key=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()

  const items = (data.items ?? [])
    .filter((item: { volumeInfo?: { imageLinks?: { thumbnail?: string } } }) =>
      item.volumeInfo?.imageLinks?.thumbnail
    )
    .map((item: { volumeInfo: { imageLinks: { thumbnail: string } } }) => ({
      thumbnail: item.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://'),
    }))

  return NextResponse.json({ items })
}
