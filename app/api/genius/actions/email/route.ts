import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()

    console.log("[v0] GENIUS sending email:", params)

    // Email sending logic using Mailgun
    const response = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        from: "GENIUS <genius@pcs-pcrm.com>",
        to: params.to || "recipient@example.com",
        subject: params.subject || "Message from GENIUS",
        text: params.message || params.text || "",
      }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      data,
    })
  } catch (error) {
    console.error("[v0] GENIUS email error:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
