import Anthropic from '@anthropic-ai/sdk'

// AI Provider Configuration
const ENABLE_CLAUDE = process.env.ENABLE_CLAUDE_SONNET === 'true'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

// Initialize Anthropic client
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AICompletionOptions {
  messages: AIMessage[]
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export interface AICompletionResponse {
  content: string
  model: string
  provider: 'claude' | 'openai' | 'mock'
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

/**
 * Generate AI completion using Claude Sonnet 4.5 (when enabled) or fallback provider
 * This function routes all AI requests through Claude Sonnet 4.5 when ENABLE_CLAUDE_SONNET=true
 */
export async function generateAICompletion(
  options: AICompletionOptions
): Promise<AICompletionResponse> {
  const { messages, maxTokens = 4096, temperature = 0.7, systemPrompt } = options

  // Use Claude Sonnet 4.5 when enabled
  if (ENABLE_CLAUDE && anthropic) {
    try {
      console.log('[AI Provider] Using Claude Sonnet 4.5')
      
      // Convert messages to Anthropic format
      const anthropicMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

      // Extract system message or use provided systemPrompt
      const systemMessage = systemPrompt || messages.find(m => m.role === 'system')?.content || 
        'You are a helpful AI assistant powered by Claude Sonnet 4.5.'

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        temperature,
        system: systemMessage,
        messages: anthropicMessages,
      })

      const content = response.content[0].type === 'text' ? response.content[0].text : ''

      return {
        content,
        model: 'claude-sonnet-4-20250514',
        provider: 'claude',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      }
    } catch (error) {
      console.error('[AI Provider] Claude error:', error)
      // Fall through to mock provider
    }
  }

  // Mock provider (for development without API keys)
  console.log('[AI Provider] Using mock provider (no API keys configured)')
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || ''
  
  return {
    content: `[Mock Response - Claude Sonnet 4.5 ${ENABLE_CLAUDE ? 'ENABLED' : 'DISABLED'}]\n\nI received your message: "${lastUserMessage}"\n\nTo enable real AI responses, please configure your API keys in .env.local:\n- Set ENABLE_CLAUDE_SONNET=true\n- Add your ANTHROPIC_API_KEY\n\nClaude Sonnet 4.5 is currently ${ENABLE_CLAUDE ? 'ENABLED' : 'DISABLED'} for all clients.`,
    model: 'mock-model',
    provider: 'mock',
  }
}

/**
 * Check if Claude Sonnet 4.5 is enabled
 */
export function isClaudeEnabled(): boolean {
  return ENABLE_CLAUDE && !!anthropic
}

/**
 * Get the current AI provider status
 */
export function getAIProviderStatus() {
  return {
    claudeEnabled: ENABLE_CLAUDE,
    claudeConfigured: !!ANTHROPIC_API_KEY,
    openaiConfigured: !!OPENAI_API_KEY,
    activeProvider: ENABLE_CLAUDE && anthropic ? 'claude-sonnet-4-20250514' : 'mock',
  }
}
