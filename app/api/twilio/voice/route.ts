import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let To = ''
  
  const contentType = request.headers.get('content-type') || ''
  
  if (contentType.includes('application/json')) {
    const body = await request.json()
    To = body.To
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text()
    const params = new URLSearchParams(text)
    To = params.get('To') || ''
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${process.env.TWILIO_PHONE_NUMBER}">
    ${To}
  </Dial>
</Response>`

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}