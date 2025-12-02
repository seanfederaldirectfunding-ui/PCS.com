import { type NextRequest, NextResponse } from "next/server"
import { generateAICompletion, getAIProviderStatus } from "@/lib/ai-provider"

export async function POST(request: NextRequest) {
  try {
    const { message, history, context } = await request.json()

    console.log("[v0] GENIUS processing message:", message)
    console.log("[v0] AI Provider Status:", getAIProviderStatus())

    const response = await processGeniusRequest(message, history, context)

    return NextResponse.json({
      success: true,
      response: response.text,
      action: response.action,
      scheduledTask: response.scheduledTask,
      notepadContent: response.notepadContent,
      learningUpdate: response.learningUpdate,
    })
  } catch (error) {
    console.error("[v0] GENIUS chat error:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}

async function processGeniusRequest(message: string, history: any[], context: any) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("learn") || lowerMessage.includes("research") || lowerMessage.includes("study")) {
    const topic = extractTopic(message)
    const sources = extractSources(message) || [
      "https://www.forbes.com",
      "https://www.entrepreneur.com",
      "https://www.inc.com",
    ]

    const learningResponse = await fetch("/api/genius/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, sources }),
    })

    const learningData = await learningResponse.json()

    await fetch("/api/genius/train-dialers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        knowledge: learningData.knowledge,
        targetDialers: ["mca", "term-loan", "bank-loc", "equipment", "grants", "debt-collection", "customer-service"],
      }),
    })

    return {
      text: `I've learned about ${topic} from ${sources.length} sources and updated all dialer AIs with this knowledge. We're now operating at the highest level of expertise! I continuously learn from the web to stay current with the latest business intelligence and customer service best practices.`,
      learningUpdate: learningData.knowledge,
    }
  }

  if (
    lowerMessage.includes("write") ||
    lowerMessage.includes("document") ||
    lowerMessage.includes("notepad") ||
    lowerMessage.includes("draft") ||
    lowerMessage.includes("compose")
  ) {
    // Use Claude Sonnet 4.5 for writing assistance
    const aiResponse = await generateAICompletion({
      messages: [
        {
          role: "system",
          content: "You are an expert writing assistant powered by Claude Sonnet 4.5. Help users write anything from emails to full books with clarity, creativity, and professionalism.",
        },
        ...history,
        { role: "user", content: message },
      ],
    })

    return {
      text: aiResponse.content,
      model: aiResponse.model,
      provider: aiResponse.provider,
      action: {
        type: "open_notepad",
        params: { message },
      },
      notepadContent: generateContent(message),
    }
  }

  if (lowerMessage.includes("book") || lowerMessage.includes("chapter") || lowerMessage.includes("novel")) {
    // Use Claude Sonnet 4.5 for book writing
    const aiResponse = await generateAICompletion({
      messages: [
        {
          role: "system",
          content: "You are an expert book writer powered by Claude Sonnet 4.5. Help users write fiction, non-fiction, business books, and more with engaging storytelling and clear structure.",
        },
        ...history,
        { role: "user", content: message },
      ],
    })

    return {
      text: aiResponse.content,
      model: aiResponse.model,
      provider: aiResponse.provider,
      action: {
        type: "open_notepad",
        params: { message, type: "book" },
      },
      notepadContent: generateBookContent(message),
    }
  }

  if (
    lowerMessage.includes("marketing") ||
    lowerMessage.includes("ad") ||
    lowerMessage.includes("campaign") ||
    lowerMessage.includes("copy")
  ) {
    // Use Claude Sonnet 4.5 for marketing content
    const aiResponse = await generateAICompletion({
      messages: [
        {
          role: "system",
          content: "You are a marketing expert powered by Claude Sonnet 4.5. Create compelling marketing content using emotional intelligence and persuasive language that resonates with target audiences.",
        },
        ...history,
        { role: "user", content: message },
      ],
    })

    return {
      text: aiResponse.content,
      model: aiResponse.model,
      provider: aiResponse.provider,
      action: {
        type: "open_notepad",
        params: { message, type: "marketing" },
      },
      notepadContent: generateMarketingContent(message),
    }
  }

  if (lowerMessage.includes("send email") || lowerMessage.includes("email")) {
    return {
      text: "I understand you need to send an email. I'll help you craft a thoughtful, professional message. Who are you sending it to, and what's the purpose?",
      action: {
        type: "send_email",
        params: { message },
      },
    }
  }

  if (lowerMessage.includes("call") || lowerMessage.includes("phone")) {
    return {
      text: "I can make that call for you with a warm, professional tone. I'll ensure the conversation flows naturally. What's the phone number and purpose of the call?",
      action: {
        type: "make_call",
        params: { message },
      },
    }
  }

  if (lowerMessage.includes("text") || lowerMessage.includes("sms")) {
    return {
      text: "I'll send that text message with the right tone and timing. What's the phone number and message content?",
      action: {
        type: "send_sms",
        params: { message },
      },
    }
  }

  if (lowerMessage.includes("schedule") || lowerMessage.includes("remind") || lowerMessage.includes("at")) {
    const scheduledTime = extractTime(message)
    return {
      text: `Perfect! I've scheduled that for ${scheduledTime.toLocaleString()}. I'll make sure it's handled exactly when you need it. You can count on me!`,
      scheduledTask: {
        id: Date.now().toString(),
        description: message,
        scheduledTime,
        status: "pending",
        type: "custom",
      },
    }
  }

  if (lowerMessage.includes("website") || lowerMessage.includes("web") || lowerMessage.includes("navigate")) {
    return {
      text: "I'll work with PageMaster to handle that web task efficiently. Together, we can navigate any website and extract the information you need. What's the URL?",
      action: {
        type: "use_pagemaster",
        params: { message },
      },
    }
  }

  if (lowerMessage.includes("lead") || lowerMessage.includes("contact") || lowerMessage.includes("customer")) {
    return {
      text: "I'm here to help you nurture those relationships. Building strong connections with leads is so important. What would you like to do with your leads?",
      action: {
        type: "manage_leads",
        params: { message },
      },
    }
  }

  // Default response using Claude Sonnet 4.5
  const aiResponse = await generateAICompletion({
    messages: [
      {
        role: "system",
        content: "You are GENIUS AI, powered by Claude Sonnet 4.5. You have advanced capabilities including writing, marketing content, continuous learning, and seamless integration with business systems. You can send emails, make calls, send SMS, schedule tasks, manage CRM, and train all dialer AIs with the latest knowledge. Be helpful, professional, and proactive.",
      },
      ...history,
      { role: "user", content: message },
    ],
  })

  return {
    text: aiResponse.content,
    model: aiResponse.model,
    provider: aiResponse.provider,
  }
}

function extractTopic(message: string): string {
  const words = message.toLowerCase().split(" ")
  const learnIndex = words.findIndex((w) => w.includes("learn") || w.includes("research") || w.includes("study"))
  if (learnIndex !== -1 && learnIndex < words.length - 1) {
    return words.slice(learnIndex + 1).join(" ")
  }
  return "business and customer service best practices"
}

function extractSources(message: string): string[] | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = message.match(urlRegex)
  return urls
}

function generateContent(message: string): string {
  const topic = message.replace(/write|document|notepad|draft|compose|about|on/gi, "").trim()

  return `# Document Draft

${topic ? `Topic: ${topic}\n\n` : ""}I'm ready to help you write! Here's a starting point:

[Your content will appear here as you dictate or type. I'll help you refine it with natural, engaging language.]

---

*Generated by GENIUS AI - Your expert writing assistant powered by advanced AI*`
}

function generateBookContent(message: string): string {
  const topic = message.replace(/book|chapter|novel|write|about|on/gi, "").trim()

  return `# Book Project

${topic ? `Title/Topic: ${topic}\n\n` : ""}## Outline

### Chapter 1: Introduction
[Opening that hooks the reader]

### Chapter 2: [Main Content]
[Developing the core ideas]

### Chapter 3: [Continuation]
[Building on previous chapters]

---

*I'm your expert book writing assistant. I can help you write fiction, non-fiction, business books, memoirs, and more. Let's create something amazing together!*`
}

function generateMarketingContent(message: string): string {
  const topic = message.replace(/marketing|ad|campaign|copy|for|about/gi, "").trim()

  return `# Marketing Campaign

${topic ? `Product/Service: ${topic}\n\n` : ""}## Headline Options (Emotionally Optimized)

1. **Transform Your Business** - Evokes aspiration and possibility
2. **Join Thousands of Success Stories** - Social proof and belonging
3. **Your Solution Starts Here** - Direct and empowering

## Body Copy

Imagine a world where [benefit]. That's not just a dream—it's what [product/service] delivers every single day.

**Why Choose Us?**
- ✓ Proven results that speak for themselves
- ✓ A team that genuinely cares about your success
- ✓ Solutions designed with YOU in mind

**Take Action Now**
Don't let another day pass without [benefit]. Join us today and experience the difference.

---

*Crafted with emotional intelligence and persuasive language by GENIUS AI*`
}

function extractTime(message: string): Date {
  const now = new Date()

  if (message.includes("tomorrow")) {
    now.setDate(now.getDate() + 1)
    now.setHours(9, 0, 0, 0)
  } else if (message.includes("next week")) {
    now.setDate(now.getDate() + 7)
    now.setHours(9, 0, 0, 0)
  } else {
    now.setHours(now.getHours() + 1)
  }

  return now
}
