import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { knowledge, targetDialers } = await request.json()

    console.log("[v0] GENIUS training dialer AIs:", targetDialers)

    // GENIUS shares her knowledge with all dialer AIs
    const trainingResults = await trainDialerAIs(knowledge, targetDialers)

    return NextResponse.json({
      success: true,
      trained: trainingResults.trained,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] GENIUS training error:", error)
    return NextResponse.json({ success: false, error: "Failed to train dialer AIs" }, { status: 500 })
  }
}

async function trainDialerAIs(knowledge: any, targetDialers: string[]) {
  const trained = []

  for (const dialerType of targetDialers) {
    try {
      // Update the AI training for each dialer type
      const trainingData = {
        dialerType,
        knowledge,
        conversationalSkills: {
          empathy: knowledge.empathy || "high",
          naturalLanguage: knowledge.naturalLanguage || "advanced",
          emotionalIntelligence: knowledge.emotionalIntelligence || "expert",
        },
        businessIntelligence: {
          industryKnowledge: knowledge.industryKnowledge || [],
          bestPractices: knowledge.bestPractices || [],
          complianceRules: knowledge.complianceRules || [],
        },
        customerServiceSkills: {
          problemSolving: knowledge.problemSolving || "expert",
          conflictResolution: knowledge.conflictResolution || "advanced",
          productKnowledge: knowledge.productKnowledge || [],
        },
        lastTrainingUpdate: new Date().toISOString(),
      }

      // Store training data (in production, this would update a database)
      console.log(`[v0] GENIUS trained ${dialerType} AI:`, trainingData)

      trained.push(dialerType)
    } catch (error) {
      console.error(`[v0] Failed to train ${dialerType}:`, error)
    }
  }

  return { trained }
}
