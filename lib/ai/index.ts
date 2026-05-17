import type { LLMProvider } from './provider'
import { OpenAIProvider } from './openai'
import { PreviewLLMProvider } from './preview'

// Factory — set LLM_PROVIDER env var to switch providers without code changes.
// To add a provider: implement LLMProvider in a new file, add a case below.
export function getLLMProvider(): LLMProvider {
  if (process.env.PREVIEW_MODE === '1') return new PreviewLLMProvider()

  const provider = process.env.LLM_PROVIDER ?? 'openai'
  switch (provider) {
    case 'openai':
      return new OpenAIProvider()
    // Future: case 'anthropic': return new AnthropicProvider()
    // Future: case 'local':     return new LocalProvider()
    default:
      throw new Error(`Unknown LLM provider: ${provider}`)
  }
}
