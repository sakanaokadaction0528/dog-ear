import { NextResponse } from 'next/server'

// Diagnostic endpoint — lists available Gemini models and tests the API key
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 })
  }

  // List available models
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({
        status: res.status,
        error: data,
        keyPrefix: apiKey.slice(0, 8) + '...',
      }, { status: 200 })
    }

    const models = (data.models ?? [])
      .filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes('generateContent')
      )
      .map((m: { name: string }) => m.name)

    return NextResponse.json({
      ok: true,
      keyPrefix: apiKey.slice(0, 8) + '...',
      availableModels: models,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
