import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { customer } = req.query

  // TwiML that dials the customer number
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connecting to customer</Say>
  <Dial callerId="${process.env.TWILIO_PHONE_NUMBER}" timeout="30">
    ${customer}
  </Dial>
</Response>`

  res.setHeader('Content-Type', 'text/xml')
  res.send(twiml)
}