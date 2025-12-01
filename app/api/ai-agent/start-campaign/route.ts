import { NextRequest, NextResponse } from 'next/server'
import { twilioService } from '@/lib/twilio-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contacts, campaignType } = body

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No contacts provided' },
        { status: 400 }
      )
    }

    if (campaignType !== 'ai' && campaignType !== 'human') {
      return NextResponse.json(
        { success: false, error: 'Invalid campaign type' },
        { status: 400 }
      )
    }

    console.log(`[AI Agent] Starting ${campaignType} campaign with ${contacts.length} contacts`)

    if (campaignType === 'ai') {
      // Start AI-powered calling campaign
      const campaignId = `campaign-${Date.now()}`
      const results = await Promise.all(
        contacts.map(async (contact: any) => {
          try {
            // Make call through Twilio
            const result = await twilioService.makeCall({
              to: contact.phone,
              from: process.env.TWILIO_PHONE_NUMBER || '',
              callerId: process.env.TWILIO_PHONE_NUMBER || '',
            })

            console.log(`[AI Agent] Call initiated to ${contact.name} (${contact.phone})`)

            return {
              contactId: contact.id,
              phone: contact.phone,
              name: contact.name,
              callId: result.callId,
              status: 'initiated',
              timestamp: new Date(),
            }
          } catch (error) {
            console.error(`[AI Agent] Failed to call ${contact.phone}:`, error)
            return {
              contactId: contact.id,
              phone: contact.phone,
              name: contact.name,
              status: 'failed',
              error: String(error),
              timestamp: new Date(),
            }
          }
        })
      )

      const successCount = results.filter((r: any) => r.status === 'initiated').length
      const failureCount = results.filter((r: any) => r.status === 'failed').length

      return NextResponse.json({
        success: true,
        campaignId,
        campaignType: 'ai',
        totalContacts: contacts.length,
        successCount,
        failureCount,
        results,
        message: `AI campaign started. ${successCount} calls initiated, ${failureCount} failed.`,
      })
    } else {
      // Human campaign - just log for human agent to handle
      console.log(`[AI Agent] Human campaign queued for ${contacts.length} contacts`)

      return NextResponse.json({
        success: true,
        campaignType: 'human',
        totalContacts: contacts.length,
        message: `Human campaign queued. ${contacts.length} contacts ready for agent assignment.`,
      })
    }
  } catch (error) {
    console.error('[AI Agent] Campaign start error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to start campaign', details: String(error) },
      { status: 500 }
    )
  }
}