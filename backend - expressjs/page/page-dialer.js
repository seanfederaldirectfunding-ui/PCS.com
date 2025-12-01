const express = require('express');
const router = express.Router();
const db = require('@utils/database');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Get token for browser calling
router.get('/token', async (req, res) => {
  try {
    const { userId } = req.query;

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      accountSid,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { identity: `user-${userId}` }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    res.json({
      success: true,
      token: token.toJwt()
    });

  } catch (error) {
    console.error('Token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate token'
    });
  }
});

// For browser calls - we don't need the /call endpoint since calls are initiated from frontend
// The frontend will use the token to make calls directly through Twilio

// TwiML for outgoing calls
router.post('/twiml', (req, res) => {
  const { To } = req.body;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Dial callerId="${twilioPhone}">
        ${To}
      </Dial>
    </Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Call status callback - track call results
router.post('/call-status', async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration, To, From } = req.body;
    
    console.log(`Call ${CallSid} status: ${CallStatus}, duration: ${CallDuration}`);

    // Update call log with final status
    await db.query(
      `UPDATE page_call_logs 
       SET status = $1, duration = $2, updated_at = NOW() 
       WHERE call_sid = $3`,
      [CallStatus, CallDuration || 0, CallSid]
    );

    res.status(200).send('OK');
  } catch (error) {
    console.error('Call status update error:', error);
    res.status(500).send('Error');
  }
});

// Log call attempt
router.post('/log-call', async (req, res) => {
  try {
    const { userId, contactId, phoneNumber, callSid } = req.body;

    const result = await db.query(
      `INSERT INTO page_call_logs (user_id, contact_id, phone_number, call_sid, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING call_id`,
      [userId, contactId, phoneNumber, callSid, 'initiated']
    );

    res.json({
      success: true,
      callId: result.rows[0].call_id
    });

  } catch (error) {
    console.error('Call log error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log call'
    });
  }
});

module.exports = router;