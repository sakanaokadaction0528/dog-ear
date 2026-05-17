import type { LLMProvider } from './provider'
import { OpenAIProvider } from './openai'
import { GeminiProvider } from './gemini'
import { PreviewLLMProvider } from './preview'

export function getLLMProvider(): LLMProvider {
  if (process.env.PREVIEW_MODE === '1') return new PreviewLLMProvider()

  const provider = process.env.LLM_PROVIDER ?? 'openai'
  switch (provider) {
    case 'openai':  return new OpenAIProvider()
    case 'gemini':  return new GeminiProvider()
    case 'preview': return new PreviewLLMProvider()
    default:
      throw new Error(`Unknown LLM provider: ${provider}`)
  }
}
