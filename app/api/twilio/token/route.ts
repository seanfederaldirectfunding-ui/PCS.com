import { NextResponse } from 'next/server'
import twilio from 'twilio'

const AccessToken = twilio.jwt.AccessToken
const VoiceGrant = AccessToken.VoiceGrant

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    const apiKey = process.env.TWILIO_API_KEY_SID
    const apiSecret = process.env.TWILIO_API_KEY_SECRET
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID

    if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      )
    }

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: 'user-' + Date.now(),
      ttl: 3600,
    })

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    })

    token.addGrant(voiceGrant)

    return NextResponse.json({ token: token.toJwt() })
  } catch (error) {
    console.error('[Token] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}