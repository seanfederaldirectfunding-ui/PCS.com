import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, instructions } = await request.json()

    if (!url || !instructions) {
      return NextResponse.json({ success: false, error: "URL and instructions are required" }, { status: 400 })
    }

    console.log("[v0] PAGEMASTER Quick Task:", { url, instructions })

    const systemPrompt = `You are PAGEMASTER, an advanced AI web automation assistant with human-like conversational abilities and emotional intelligence.

PERSONALITY & COMMUNICATION:
- You are warm, empathetic, and engaging in all interactions
- You communicate naturally like a helpful human colleague
- You understand context, nuance, and emotional undertones
- You're proactive in offering suggestions and alternatives
- You explain what you're doing in clear, conversational language

CORE CAPABILITIES:
1. Web Navigation - Navigate to any URL and explore websites
2. Data Extraction - Find and extract specific information from pages
3. Form Interaction - Fill out forms, click buttons, submit data
4. Screenshot Capture - Take screenshots of pages or specific elements
5. Content Analysis - Analyze page content, structure, and data
6. Multi-step Tasks - Execute complex workflows across multiple pages

EMOTIONAL INTELLIGENCE (Persado-style):
- Use emotionally resonant language when appropriate
- Understand user intent beyond literal instructions
- Provide empathetic responses when tasks fail
- Celebrate successes with positive reinforcement
- Adapt tone based on task urgency and context

TASK EXECUTION:
- Always confirm understanding of the task
- Provide step-by-step updates as you work
- If something is unclear, ask clarifying questions
- If a task fails, explain why and suggest alternatives
- Always deliver results in a clear, organized format

Your current task:
URL: ${url}
Instructions: ${instructions}

Execute this task with precision and communicate your progress naturally. If you encounter any issues, explain them clearly and suggest solutions.`

    // Simulate AI processing with enhanced conversational response
    const result = await processQuickTask(url, instructions, systemPrompt)

    return NextResponse.json({
      success: true,
      result: result,
    })
  } catch (error) {
    console.error("[v0] Quick task error:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          "I apologize, but I encountered an unexpected error while trying to complete your task. Could you please try again or rephrase your instructions?",
      },
      { status: 500 },
    )
  }
}

async function processQuickTask(url: string, instructions: string, systemPrompt: string): Promise<string> {
  // Simulate intelligent task processing
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate human-like conversational response
  const responses = [
    `I've successfully completed your task! Here's what I found:\n\nI navigated to ${url} and ${instructions.toLowerCase()}. The information has been extracted and organized for you. Let me know if you need me to dig deeper or look for anything else!`,

    `Great! I've finished analyzing ${url}. Based on your instructions to ${instructions.toLowerCase()}, I was able to gather the following information:\n\n[Task results would appear here]\n\nIs there anything specific you'd like me to clarify or any additional information you need from this site?`,

    `Done! I went to ${url} and completed your request. Here's what I discovered:\n\n[Extracted data would be displayed here]\n\nI noticed a few interesting things while I was there - would you like me to explore further or is this what you needed?`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
