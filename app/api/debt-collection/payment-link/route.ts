import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accountId, amount, paymentType, debtorEmail, debtorPhone } = await request.json()

    console.log("[v0] Generating payment link for account:", accountId)

    // Generate unique payment link
    const paymentLinkId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://pagecrm.vercel.app"}/pay/${paymentLinkId}`

    // In production, integrate with Stripe to create actual payment link
    // const stripePaymentLink = await stripe.paymentLinks.create({
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   metadata: { accountId, paymentType }
    // })

    // Send payment link via email and SMS
    const emailSent = await sendPaymentEmail(debtorEmail, paymentLink, amount)
    const smsSent = await sendPaymentSMS(debtorPhone, paymentLink, amount)

    return NextResponse.json({
      success: true,
      paymentLink,
      paymentLinkId,
      emailSent,
      smsSent,
    })
  } catch (error) {
    console.error("[v0] Error generating payment link:", error)
    return NextResponse.json({ success: false, error: "Failed to generate payment link" }, { status: 500 })
  }
}

async function sendPaymentEmail(email: string, link: string, amount: number) {
  console.log("[v0] Sending payment email to:", email)
  // Integrate with Mailgun or other email service
  return true
}

async function sendPaymentSMS(phone: string, link: string, amount: number) {
  console.log("[v0] Sending payment SMS to:", phone)
  // Integrate with Twilio or other SMS service
  return true
}
