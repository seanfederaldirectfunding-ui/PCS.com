import { type NextRequest, NextResponse } from "next/server"
import { getAIProviderStatus, isClaudeEnabled } from "@/lib/ai-provider"

export async function GET(request: NextRequest) {
  try {
    const status = getAIProviderStatus()
    
    return NextResponse.json({
      success: true,
      claudeSonnet45Enabled: status.claudeEnabled && status.claudeConfigured,
      status: {
        ...status,
        message: status.claudeEnabled && status.claudeConfigured
          ? "✅ Claude Sonnet 4.5 is ENABLED for all clients"
          : status.claudeEnabled
          ? "⚠️  Claude Sonnet 4.5 is enabled but API key not configured"
          : "❌ Claude Sonnet 4.5 is disabled",
      },
    })
  } catch (error) {
    console.error("[v0] AI Provider status check error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to check AI provider status" 
    }, { status: 500 })
  }
}
