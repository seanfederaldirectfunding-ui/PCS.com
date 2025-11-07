import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, amount, reason } = await request.json()

    // Validate required fields
    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing payment intent ID" }, { status: 400 })
    }

    console.log("[v0] Processing refund:", { paymentIntentId, amount, reason })

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const refund = {
      id: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentIntentId,
      amount,
      reason: reason || "requested_by_customer",
      status: "succeeded",
      created: new Date().toISOString(),
      account_id: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID,
    }

    console.log("[v0] Refund processed:", refund)

    return NextResponse.json(refund)
  } catch (error) {
    console.error("[v0] Error processing refund:", error)
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 })
  }
}
