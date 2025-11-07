import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { topic, sources } = await request.json()

    console.log("[v0] GENIUS learning from web:", { topic, sources })

    // GENIUS uses PAGEMASTER to scrape and learn from websites
    const learningResults = await geniusLearnFromWeb(topic, sources)

    return NextResponse.json({
      success: true,
      knowledge: learningResults.knowledge,
      sources: learningResults.sources,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] GENIUS learning error:", error)
    return NextResponse.json({ success: false, error: "Failed to learn from web" }, { status: 500 })
  }
}

async function geniusLearnFromWeb(topic: string, sources: string[]) {
  // GENIUS commands PAGEMASTER to scrape websites
  const scrapedData = []

  for (const url of sources) {
    try {
      const response = await fetch("/api/pagemaster/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          instructions: `Learn everything about ${topic} from this website. Extract key concepts, best practices, and important information.`,
        }),
      })

      const data = await response.json()
      if (data.success) {
        scrapedData.push({
          url,
          content: data.results,
          scrapedAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error(`[v0] Failed to scrape ${url}:`, error)
    }
  }

  // Process and synthesize knowledge
  const knowledge = synthesizeKnowledge(topic, scrapedData)

  return {
    knowledge,
    sources: scrapedData.map((d) => d.url),
  }
}

function synthesizeKnowledge(topic: string, scrapedData: any[]) {
  // In production, this would use AI to synthesize the scraped data
  // For now, we'll create a structured knowledge base

  return {
    topic,
    summary: `Comprehensive knowledge about ${topic} gathered from ${scrapedData.length} sources`,
    keyPoints: scrapedData.flatMap((data) => extractKeyPoints(data.content)),
    bestPractices: scrapedData.flatMap((data) => extractBestPractices(data.content)),
    examples: scrapedData.flatMap((data) => extractExamples(data.content)),
    lastUpdated: new Date().toISOString(),
  }
}

function extractKeyPoints(content: any): string[] {
  // Extract key points from scraped content
  // In production, use AI to identify important information
  return ["Key point 1", "Key point 2", "Key point 3"]
}

function extractBestPractices(content: any): string[] {
  // Extract best practices from scraped content
  return ["Best practice 1", "Best practice 2"]
}

function extractExamples(content: any): string[] {
  // Extract examples from scraped content
  return ["Example 1", "Example 2"]
}
