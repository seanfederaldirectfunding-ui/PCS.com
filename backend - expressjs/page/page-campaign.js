const express = require('express');
const router = express.Router();
const db = require('@utils/database');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

// In-memory campaign state
const activeCampaigns = new Map();
const activeAgents = new Map();
const currentCalls = new Map();

// ============================================
// CAMPAIGN MANAGEMENT
// ============================================

// Create new campaign
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      type = 'power',
      contactIds,
      callsPerHour = 60,
      maxConcurrentCalls = 3,
      amdEnabled = true,
      voicemailAction = 'leave_message',
      voicemailMessageId,
      startTime = '09:00:00',
      endTime = '17:00:00'
    } = req.body;

    if (!name || !contactIds || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Campaign name and contacts are required'
      });
    }

    // Get user ID from headers
    const userId = req.headers['user-id'] || req.headers['user_id'] || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Create campaign
    const campaignResult = await db.query(
      `INSERT INTO page_campaigns 
       (name, type, calls_per_hour, max_concurrent_calls, amd_enabled, 
        voicemail_action, start_time, end_time, total_contacts, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft', $10)
       RETURNING *`,
      [name, type, callsPerHour, maxConcurrentCalls, amdEnabled, 
       voicemailAction, startTime, endTime, contactIds.length, userId]
    );

    const campaign = campaignResult.rows[0];

    // Add contacts to campaign
    for (const contactId of contactIds) {
      await db.query(
        `INSERT INTO page_campaign_contacts 
         (campaign_id, contact_id, status, next_attempt_at)
         VALUES ($1, $2, 'pending', NOW())`,
        [campaign.campaign_id, contactId]
      );
    }

    // Get voicemail message URL if provided
    if (voicemailMessageId) {
      const msgResult = await db.query(
        `SELECT audio_url FROM page_voicemail_messages WHERE message_id = $1`,
        [voicemailMessageId]
      );
      if (msgResult.rows.length > 0) {
        await db.query(
          `UPDATE page_campaigns SET voicemail_message_url = $1 WHERE campaign_id = $2`,
          [msgResult.rows[0].audio_url, campaign.campaign_id]
        );
        campaign.voicemail_message_url = msgResult.rows[0].audio_url;
      }
    }

    res.json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error('[Campaign] Create error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start campaign
router.post('/start', async (req, res) => {
  try {
    const { campaignId, agentId } = req.body;

    if (!campaignId || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and Agent ID are required'
      });
    }

    // Get campaign details
    const campaignResult = await db.query(
      `SELECT * FROM page_campaigns WHERE campaign_id = $1`,
      [campaignId]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const campaign = campaignResult.rows[0];

    // Update campaign status
    await db.query(
      `UPDATE page_campaigns SET status = 'active', updated_at = NOW() WHERE campaign_id = $1`,
      [campaignId]
    );

    // Update agent status
    await db.query(
      `UPDATE page_users SET agent_status = 'active', current_campaign_id = $1 WHERE user_id = $2`,
      [campaignId, agentId]
    );

    // Initialize campaign state
    activeCampaigns.set(campaignId, {
      ...campaign,
      status: 'active',
      startedAt: new Date(),
      activeAgents: new Set([agentId]),
      currentCalls: 0,
      callsThisHour: 0,
      lastCallTime: null,
      currentDialingContact: null,
      totalContacts: campaign.total_contacts,
      contactsCalled: 0,
      connectedCalls: 0,
      failedCalls: 0,
      agentId: agentId,
      dialInterval: null,
      hourlyResetInterval: null
    });

    // Initialize agent state
    activeAgents.set(agentId, {
      campaignId,
      status: 'ready',
      currentCall: null,
      callsToday: 0
    });

    // Start the dialing engine
    startDialingEngine(campaignId);

    const campaignState = activeCampaigns.get(campaignId);
    res.json({
      success: true,
      message: 'Campaign started',
      campaign: {
        campaign_id: campaignState.campaign_id,
        name: campaignState.name,
        status: campaignState.status,
        calls_per_hour: campaignState.calls_per_hour,
        max_concurrent_calls: campaignState.max_concurrent_calls,
        currentCalls: campaignState.currentCalls,
        callsThisHour: campaignState.callsThisHour,
        startedAt: campaignState.startedAt,
        created_at: campaignState.created_at,
        currentDialingContact: campaignState.currentDialingContact
      }
    });

  } catch (error) {
    console.error('[Campaign] Start error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DIALING ENGINE
// ============================================

async function startDialingEngine(campaignId) {
  const campaign = activeCampaigns.get(campaignId);
  if (!campaign) return;

  console.log(`[Dialer] Starting engine for campaign: ${campaignId}`);
  console.log(`[Dialer] Settings: ${campaign.calls_per_hour} calls/hour, ${campaign.max_concurrent_calls} concurrent lines`);

  // Start making first call immediately
  setTimeout(() => makeNextCall(campaignId), 1000);

  // Main dialing loop
  const dialInterval = setInterval(async () => {
    try {
      const campaignState = activeCampaigns.get(campaignId);
      if (!campaignState || campaignState.status !== 'active') {
        console.log(`[Dialer] Stopping engine - campaign ${campaignId} is ${campaignState?.status || 'not found'}`);
        clearInterval(dialInterval);
        return;
      }

      // Check if we have any pending contacts left
      const pendingCount = await getPendingContactsCount(campaignId);
      const completedCount = await getCompletedContactsCount(campaignId);
      const totalContacts = campaignState.totalContacts;
      
      console.log(`[Dialer] Progress: ${completedCount}/${totalContacts} completed, ${pendingCount} pending, ${campaignState.currentCalls} active calls`);
      
      if (pendingCount === 0 && campaignState.currentCalls === 0) {
        console.log(`[Dialer] Campaign completed - no pending contacts and no active calls`);
        await completeCampaign(campaignId);
        clearInterval(dialInterval);
        return;
      }

      // Calculate delay between calls based on calls per hour
      const callsPerSecond = campaignState.calls_per_hour / 3600;
      const delayBetweenCalls = 1 / callsPerSecond;
      
      const timeSinceLastCall = campaignState.lastCallTime 
        ? (Date.now() - campaignState.lastCallTime) / 1000 
        : 999;

      // Check if we should dial based on calls per hour
      if (timeSinceLastCall < delayBetweenCalls) {
        return;
      }

      // Check concurrent call limit
      if (campaignState.currentCalls >= campaignState.max_concurrent_calls) {
        return;
      }

      // Make next call
      await makeNextCall(campaignId);

    } catch (error) {
      console.error('[Dialer] Engine error:', error);
    }
  }, 1000);

  // Store interval reference for cleanup
  campaign.dialInterval = dialInterval;

  // Reset hourly counter
  const hourlyReset = setInterval(() => {
    const campaignState = activeCampaigns.get(campaignId);
    if (campaignState) {
      console.log(`[Dialer] Hourly reset: ${campaignState.callsThisHour} calls made this hour`);
      campaignState.callsThisHour = 0;
    }
  }, 3600000);

  campaign.hourlyResetInterval = hourlyReset;
}

async function getPendingContactsCount(campaignId) {
  try {
    const result = await db.query(
      `SELECT COUNT(*) as count 
       FROM page_campaign_contacts 
       WHERE campaign_id = $1 AND status = 'pending'`,
      [campaignId]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('[Dialer] Get pending count error:', error);
    return 0;
  }
}

async function getCompletedContactsCount(campaignId) {
  try {
    const result = await db.query(
      `SELECT COUNT(*) as count 
       FROM page_campaign_contacts 
       WHERE campaign_id = $1 AND status IN ('completed', 'failed')`,
      [campaignId]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('[Dialer] Get completed count error:', error);
    return 0;
  }
}

async function makeNextCall(campaignId) {
  const campaignState = activeCampaigns.get(campaignId);
  if (!campaignState || campaignState.status !== 'active') {
    return;
  }

  // Get next contact to call
  const nextContact = await getNextContact(campaignId);
  if (!nextContact) {
    console.log(`[Dialer] No contacts available for campaign: ${campaignId}`);
    
    // Check if campaign should complete
    const completedCount = await getCompletedContactsCount(campaignId);
    if (completedCount >= campaignState.totalContacts && campaignState.currentCalls === 0) {
      console.log(`[Dialer] All contacts processed, completing campaign`);
      await completeCampaign(campaignId);
    }
    return;
  }

  console.log(`[Dialer] Making call to ${nextContact.name} (${nextContact.phone})`);

  // Set currently dialing contact for frontend display
  campaignState.currentDialingContact = {
    name: nextContact.name,
    phone: nextContact.phone,
    company: nextContact.company,
    email: nextContact.email,
    contact_id: nextContact.contact_id
  };

  // Make the call
  await initiateCall(campaignId, nextContact);
  
  // Update state
  campaignState.currentCalls++;
  campaignState.callsThisHour++;
  campaignState.contactsCalled++;
  campaignState.lastCallTime = Date.now();
}

async function getNextContact(campaignId) {
  try {
    const result = await db.query(
      `SELECT cc.*, c.name, c.phone, c.email, c.company
       FROM page_campaign_contacts cc
       JOIN page_contacts c ON cc.contact_id = c.contact_id
       WHERE cc.campaign_id = $1 
         AND cc.status = 'pending'
         AND cc.next_attempt_at <= NOW()
       ORDER BY cc.priority DESC, cc.next_attempt_at ASC
       LIMIT 1`,
      [campaignId]
    );

    if (result.rows.length === 0) return null;

    const contact = result.rows[0];

    // Mark as calling
    await db.query(
      `UPDATE page_campaign_contacts 
       SET status = 'calling', last_attempt_at = NOW(), attempt_count = COALESCE(attempt_count, 0) + 1
       WHERE id = $1`,
      [contact.id]
    );

    return contact;
  } catch (error) {
    console.error('[Dialer] Get next contact error:', error);
    return null;
  }
}

async function initiateCall(campaignId, contact) {
  const campaign = activeCampaigns.get(campaignId);
  if (!campaign) return;

  console.log(`[Dialer] Initiating call to ${contact.name} (${contact.phone})`);

  let agentId = campaign.agentId;
  let callSid = null;
  
  try {
    // Create TwiML URL
    const twimlUrl = `${process.env.BASE_URL}/api/page/dialer/campaign/twiml-simple`;

    // Make Twilio call with AMD if enabled
    const callParams = {
      url: twimlUrl,
      to: contact.phone,
      from: twilioPhone,
      statusCallback: `${process.env.BASE_URL}/api/page/dialer/campaign/status-callback`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      timeout: 30,
      record: false
    };

    // Add AMD if enabled
    if (campaign.amd_enabled) {
      callParams.machineDetection = 'DetectMessageEnd';
      callParams.asyncAmd = true;
      callParams.asyncAmdStatusCallback = `${process.env.BASE_URL}/api/page/dialer/campaign/amd-callback`;
      callParams.asyncAmdStatusCallbackMethod = 'POST';
    }

    const call = await client.calls.create(callParams);
    callSid = call.sid;

    console.log(`[Dialer] ✅ Call created: ${call.sid} to ${contact.phone}`);

    // Store in call tracking
    currentCalls.set(call.sid, {
      campaignId,
      contactId: contact.contact_id,
      agentId,
      contact,
      status: 'dialing',
      startTime: new Date()
    });

    // Log the call
    await db.query(
      `INSERT INTO page_call_logs 
       (campaign_id, contact_id, phone_number, call_sid, direction, status, agent_id, user_id, contact_name, contact_company)
       VALUES ($1, $2, $3, $4, 'outbound', 'initiated', $5, $6, $7, $8)`,
      [campaignId, contact.contact_id, contact.phone, call.sid, agentId, agentId, contact.name, contact.company || '']
    );

    // Update campaign stats
    await db.query(
      `UPDATE page_campaigns 
       SET contacts_called = COALESCE(contacts_called, 0) + 1,
           updated_at = NOW()
       WHERE campaign_id = $1`,
      [campaignId]
    );

  } catch (error) {
    console.error(`[Dialer] ❌ Failed to initiate call to ${contact.phone}:`, error.message);
    
    // Handle Twilio trial errors gracefully - mark as failed and continue
    const errorMessage = error.message.substring(0, 50);
    
    // Mark contact as failed with specific error
    await db.query(
      `UPDATE page_campaign_contacts 
       SET status = 'failed', call_result = $1, last_attempt_at = NOW()
       WHERE contact_id = $2 AND campaign_id = $3`,
      [errorMessage, contact.contact_id, campaignId]
    );

    // Log the failed call
    await db.query(
      `INSERT INTO page_call_logs 
       (campaign_id, contact_id, phone_number, direction, status, call_result, agent_id, user_id, contact_name, contact_company)
       VALUES ($1, $2, $3, 'outbound', 'failed', $4, $5, $6, $7, $8)`,
      [campaignId, contact.contact_id, contact.phone, errorMessage, agentId, agentId, contact.name, contact.company || '']
    );

    // Update campaign failed calls count
    await db.query(
      `UPDATE page_campaigns 
       SET failed_calls = COALESCE(failed_calls, 0) + 1,
           updated_at = NOW()
       WHERE campaign_id = $1`,
      [campaignId]
    );

    // CRITICAL FIX: Immediately clear currently dialing contact and update campaign state
    const campaignState = activeCampaigns.get(campaignId);
    if (campaignState) {
      campaignState.currentDialingContact = null;
      campaignState.currentCalls = Math.max(0, campaignState.currentCalls - 1);
      
      // Check if campaign should complete
      const completedCount = await getCompletedContactsCount(campaignId);
      if (completedCount >= campaignState.totalContacts && campaignState.currentCalls === 0) {
        console.log(`[Dialer] All contacts processed after failed call, completing campaign`);
        await completeCampaign(campaignId);
      }
    }

    console.log(`[Dialer] ✅ Call marked as failed and campaign continues: ${contact.phone}`);
  }
}

// ============================================
// CAMPAIGN CONTROL
// ============================================

// Pause campaign
router.post('/pause', async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      });
    }

    await db.query(
      `UPDATE page_campaigns SET status = 'paused', updated_at = NOW() WHERE campaign_id = $1`,
      [campaignId]
    );

    const campaign = activeCampaigns.get(campaignId);
    if (campaign) {
      campaign.status = 'paused';
      
      // Clear intervals
      if (campaign.dialInterval) {
        clearInterval(campaign.dialInterval);
        campaign.dialInterval = null;
      }
      if (campaign.hourlyResetInterval) {
        clearInterval(campaign.hourlyResetInterval);
        campaign.hourlyResetInterval = null;
      }
    }

    res.json({
      success: true,
      message: 'Campaign paused'
    });

  } catch (error) {
    console.error('[Campaign] Pause error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Resume campaign
router.post('/resume', async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      });
    }

    await db.query(
      `UPDATE page_campaigns SET status = 'active', updated_at = NOW() WHERE campaign_id = $1`,
      [campaignId]
    );

    const campaign = activeCampaigns.get(campaignId);
    if (campaign) {
      campaign.status = 'active';
      startDialingEngine(campaignId);
    }

    res.json({
      success: true,
      message: 'Campaign resumed'
    });

  } catch (error) {
    console.error('[Campaign] Resume error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop campaign
router.post('/stop', async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      });
    }

    await completeCampaign(campaignId);

    res.json({
      success: true,
      message: 'Campaign stopped'
    });

  } catch (error) {
    console.error('[Campaign] Stop error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function completeCampaign(campaignId) {
  console.log(`[Campaign] Completing campaign ${campaignId}`);
  
  const campaign = activeCampaigns.get(campaignId);
  
  if (campaign) {
    // Clear intervals
    if (campaign.dialInterval) {
      clearInterval(campaign.dialInterval);
    }
    if (campaign.hourlyResetInterval) {
      clearInterval(campaign.hourlyResetInterval);
    }

    // Hang up all active calls
    for (const [callSid, callInfo] of currentCalls.entries()) {
      if (callInfo.campaignId === campaignId) {
        try {
          await client.calls(callSid).update({ status: 'completed' });
          console.log(`[Campaign] Hung up call: ${callSid}`);
        } catch (error) {
          console.log(`[Campaign] Call ${callSid} may already be completed:`, error.message);
        }
        currentCalls.delete(callSid);
      }
    }

    // Clear current dialing contact
    campaign.currentDialingContact = null;
  }

  await db.query(
    `UPDATE page_campaigns SET status = 'completed', updated_at = NOW() WHERE campaign_id = $1`,
    [campaignId]
  );

  activeCampaigns.delete(campaignId);

  // Update all agents
  await db.query(
    `UPDATE page_users 
     SET agent_status = 'offline', current_campaign_id = NULL 
     WHERE current_campaign_id = $1`,
    [campaignId]
  );
  
  console.log(`[Campaign] ✅ Campaign ${campaignId} completed`);
}

// ============================================
// CALL MANAGEMENT
// ============================================

// Manual hangup endpoint
router.post('/call/hangup', async (req, res) => {
  try {
    const { callSid, campaignId } = req.body;

    if (!callSid) {
      return res.status(400).json({
        success: false,
        error: 'Call SID is required'
      });
    }

    console.log(`[Hangup] Manually hanging up call: ${callSid}`);

    // Update call status in Twilio
    try {
      await client.calls(callSid).update({ status: 'completed' });
      console.log(`[Hangup] ✅ Call ${callSid} hung up successfully`);
    } catch (twilioError) {
      console.log(`[Hangup] Call ${callSid} may already be completed:`, twilioError.message);
    }

    // Update call log
    await db.query(
      `UPDATE page_call_logs 
       SET status = 'completed', call_result = 'manual_hangup', updated_at = NOW()
       WHERE call_sid = $1`,
      [callSid]
    );

    // Update campaign contact
    const callInfo = currentCalls.get(callSid);
    if (callInfo) {
      await db.query(
        `UPDATE page_campaign_contacts 
         SET status = 'completed', call_result = 'manual_hangup', last_attempt_at = NOW()
         WHERE contact_id = $1 AND campaign_id = $2`,
        [callInfo.contactId, callInfo.campaignId]
      );

      // Clean up
      currentCalls.delete(callSid);
      const campaign = activeCampaigns.get(callInfo.campaignId);
      if (campaign) {
        campaign.currentCalls = Math.max(0, campaign.currentCalls - 1);
        campaign.currentDialingContact = null;
      }
    }

    res.json({
      success: true,
      message: 'Call hung up successfully'
    });

  } catch (error) {
    console.error('[Hangup] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current active calls for a campaign
router.get('/calls/active/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const activeCalls = Array.from(currentCalls.entries())
      .filter(([_, callInfo]) => callInfo.campaignId === campaignId)
      .map(([callSid, callInfo]) => ({
        callSid,
        contact: callInfo.contact,
        status: callInfo.status,
        agentId: callInfo.agentId,
        startTime: callInfo.startTime
      }));

    res.json({
      success: true,
      activeCalls
    });

  } catch (error) {
    console.error('[Active Calls] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// TWIML & CALLBACK ENDPOINTS
// ============================================

// Simple TwiML that just connects the call
router.post('/twiml-simple', (req, res) => {
  console.log('[TwiML] Simple call connection');
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">Hello, please hold for an agent.</Say>
      <Pause length="1"/>
      <Say voice="alice">This is a test call from the power dialer system.</Say>
      <Hangup/>
    </Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// AMD (Answering Machine Detection) Callback
router.post('/amd-callback', async (req, res) => {
  try {
    const { CallSid, AnsweredBy, MachineDetectionDuration } = req.body;
    
    console.log(`[AMD] Call ${CallSid} answered by: ${AnsweredBy}`);

    const callInfo = currentCalls.get(CallSid);
    if (!callInfo) {
      return res.status(200).send('OK');
    }

    // Update call log with AMD result
    await db.query(
      `UPDATE page_call_logs 
       SET amd_result = $1, wait_time = $2, status = 'completed'
       WHERE call_sid = $3`,
      [AnsweredBy === 'human' ? 'human' : 'machine', MachineDetectionDuration || 0, CallSid]
    );

    // Update campaign contact
    if (AnsweredBy !== 'human') {
      console.log(`[AMD] Voicemail detected for ${CallSid}`);

      await db.query(
        `UPDATE page_campaign_contacts 
         SET status = 'completed', call_result = 'voicemail', last_attempt_at = NOW()
         WHERE contact_id = $1 AND campaign_id = $2`,
        [callInfo.contactId, callInfo.campaignId]
      );

      // Update campaign stats
      await db.query(
        `UPDATE page_campaigns 
         SET voicemails = COALESCE(voicemails, 0) + 1,
             updated_at = NOW()
         WHERE campaign_id = $1`,
        [callInfo.campaignId]
      );

      // Handle voicemail drop if configured
      const campaign = activeCampaigns.get(callInfo.campaignId);
      if (campaign && campaign.voicemail_action === 'leave_message' && campaign.voicemail_message_url) {
        await dropVoicemail(CallSid, campaign.voicemail_message_url);
      }
    } else {
      // Human answered
      await db.query(
        `UPDATE page_campaign_contacts 
         SET status = 'completed', call_result = 'connected', last_attempt_at = NOW()
         WHERE contact_id = $1 AND campaign_id = $2`,
        [callInfo.contactId, callInfo.campaignId]
      );

      // Update campaign stats
      await db.query(
        `UPDATE page_campaigns 
         SET connected_calls = COALESCE(connected_calls, 0) + 1,
             updated_at = NOW()
         WHERE campaign_id = $1`,
        [callInfo.campaignId]
      );
    }

    // Clean up
    currentCalls.delete(CallSid);
    const campaign = activeCampaigns.get(callInfo.campaignId);
    if (campaign) {
      campaign.currentCalls = Math.max(0, campaign.currentCalls - 1);
      campaign.currentDialingContact = null;
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('[AMD] Callback error:', error);
    res.status(500).send('Error');
  }
});

// Status Callback
router.post('/status-callback', async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration, To } = req.body;
    
    console.log(`[Status] Call ${CallSid}: ${CallStatus}`);

    // Update call log
    await db.query(
      `UPDATE page_call_logs 
       SET status = $1, duration = $2, updated_at = NOW()
       WHERE call_sid = $3`,
      [CallStatus, CallDuration || 0, CallSid]
    );

    // Handle completion
    if (CallStatus === 'completed') {
      const callInfo = currentCalls.get(CallSid);
      if (callInfo) {
        // Update campaign contact
        await db.query(
          `UPDATE page_campaign_contacts 
           SET status = 'completed', call_result = 'completed', last_attempt_at = NOW()
           WHERE contact_id = $1 AND campaign_id = $2`,
          [callInfo.contactId, callInfo.campaignId]
        );

        const campaign = activeCampaigns.get(callInfo.campaignId);
        if (campaign) {
          campaign.currentCalls = Math.max(0, campaign.currentCalls - 1);
          campaign.currentDialingContact = null;
          
          // Update connected calls count if call was answered
          if (CallDuration > 0) {
            campaign.connectedCalls++;
            await db.query(
              `UPDATE page_campaigns 
               SET connected_calls = COALESCE(connected_calls, 0) + 1
               WHERE campaign_id = $1`,
              [callInfo.campaignId]
            );
          }
        }
        currentCalls.delete(CallSid);
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('[Status] Callback error:', error);
    res.status(500).send('Error');
  }
});

// ============================================
// VOICEMAIL DROP
// ============================================

async function dropVoicemail(callSid, voicemailUrl) {
  try {
    console.log(`[Voicemail] Dropping message for call ${callSid}`);

    // Use Twilio's API to play the voicemail
    await client.calls(callSid)
      .update({
        twiml: `<Response><Play>${voicemailUrl}</Play><Hangup/></Response>`
      });

    // Mark as voicemail dropped
    await db.query(
      `UPDATE page_call_logs 
       SET voicemail_dropped = true 
       WHERE call_sid = $1`,
      [callSid]
    );

    await db.query(
      `UPDATE page_campaigns 
       SET voicemail_dropped = COALESCE(voicemail_dropped, 0) + 1
       WHERE campaign_id = (SELECT campaign_id FROM page_call_logs WHERE call_sid = $1)`,
      [callSid]
    );

    console.log(`[Voicemail] Message dropped for ${callSid}`);

  } catch (error) {
    console.error('[Voicemail] Drop error:', error);
  }
}

// ============================================
// AGENT MANAGEMENT
// ============================================

// Agent joins campaign
router.post('/agent/join', async (req, res) => {
  try {
    const { campaignId, agentId } = req.body;

    if (!campaignId || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and Agent ID are required'
      });
    }

    const campaign = activeCampaigns.get(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not active'
      });
    }

    campaign.activeAgents.add(agentId);

    activeAgents.set(agentId, {
      campaignId,
      status: 'ready',
      currentCall: null,
      callsToday: 0
    });

    await db.query(
      `UPDATE page_users 
       SET agent_status = 'active', current_campaign_id = $1 
       WHERE user_id = $2`,
      [campaignId, agentId]
    );

    res.json({
      success: true,
      message: 'Agent joined campaign'
    });

  } catch (error) {
    console.error('[Agent] Join error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Agent leaves campaign
router.post('/agent/leave', async (req, res) => {
  try {
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: 'Agent ID is required'
      });
    }

    const agent = activeAgents.get(agentId);
    if (agent) {
      const campaign = activeCampaigns.get(agent.campaignId);
      if (campaign) {
        campaign.activeAgents.delete(agentId);
      }
      activeAgents.delete(agentId);
    }

    await db.query(
      `UPDATE page_users 
       SET agent_status = 'offline', current_campaign_id = NULL 
       WHERE user_id = $1`,
      [agentId]
    );

    res.json({
      success: true,
      message: 'Agent left campaign'
    });

  } catch (error) {
    console.error('[Agent] Leave error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// CALL DISPOSITION
// ============================================

router.post('/call/disposition', async (req, res) => {
  try {
    const { callSid, disposition, notes, agentId } = req.body;

    if (!callSid || !disposition || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'Call SID, disposition and agent ID are required'
      });
    }

    // Update call log
    await db.query(
      `UPDATE page_call_logs 
       SET disposition = $1, notes = $2, agent_id = $3
       WHERE call_sid = $4`,
      [disposition, notes, agentId, callSid]
    );

    // Update campaign contact
    await db.query(
      `UPDATE page_campaign_contacts 
       SET status = 'completed', call_result = $1, notes = $2
       WHERE contact_id = (
         SELECT contact_id FROM page_call_logs WHERE call_sid = $3
       )`,
      [disposition, notes, callSid]
    );

    // Update contact status based on disposition
    let contactStatus = 'contacted';
    if (disposition === 'qualified') contactStatus = 'qualified';
    if (disposition === 'converted') contactStatus = 'converted';
    if (disposition === 'not_interested') contactStatus = 'not_interested';

    await db.query(
      `UPDATE page_contacts 
       SET status = $1, last_contacted = NOW()
       WHERE contact_id = (
         SELECT contact_id FROM page_call_logs WHERE call_sid = $2
       )`,
      [contactStatus, callSid]
    );

    // Update campaign stats
    if (disposition === 'qualified') {
      await db.query(
        `UPDATE page_campaigns 
         SET qualified_leads = COALESCE(qualified_leads, 0) + 1
         WHERE campaign_id = (SELECT campaign_id FROM page_call_logs WHERE call_sid = $1)`,
        [callSid]
      );
    } else if (disposition === 'converted') {
      await db.query(
        `UPDATE page_campaigns 
         SET converted_leads = COALESCE(converted_leads, 0) + 1
         WHERE campaign_id = (SELECT campaign_id FROM page_call_logs WHERE call_sid = $1)`,
        [callSid]
      );
    }

    res.json({
      success: true,
      message: 'Disposition saved'
    });

  } catch (error) {
    console.error('[Disposition] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// CAMPAIGN STATS & HISTORY
// ============================================

// Get campaign stats
router.get('/stats/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Get campaign basic stats
    const statsResult = await db.query(
      `SELECT 
        c.*,
        COUNT(cc.contact_id) as total_contacts,
        COUNT(CASE WHEN cc.status = 'completed' THEN 1 END) as completed_contacts,
        COUNT(CASE WHEN cc.status = 'failed' THEN 1 END) as failed_contacts,
        COUNT(CASE WHEN cc.status IN ('calling', 'pending') THEN 1 END) as pending_contacts,
        COALESCE(c.contacts_called, 0) as contacts_called,
        COALESCE(c.connected_calls, 0) as connected_calls,
        COALESCE(c.failed_calls, 0) as failed_calls,
        COALESCE(c.voicemails, 0) as voicemails,
        COALESCE(c.voicemail_dropped, 0) as voicemail_dropped,
        COALESCE(c.qualified_leads, 0) as qualified_leads,
        COALESCE(c.converted_leads, 0) as converted_leads
       FROM page_campaigns c
       LEFT JOIN page_campaign_contacts cc ON c.campaign_id = cc.campaign_id
       WHERE c.campaign_id = $1
       GROUP BY c.campaign_id`,
      [campaignId]
    );

    // Get active campaign state with current dialing contact
    const activeCampaign = activeCampaigns.get(campaignId);
    
    // Get recent calls with contact details
    const recentCalls = await db.query(
      `SELECT cl.*, c.name, c.phone, c.company, c.email,
              CASE 
                WHEN cl.status = 'completed' AND cl.duration > 0 THEN 'connected'
                WHEN cl.call_result LIKE '%unverified%' THEN 'unverified_number'
                WHEN cl.status = 'failed' THEN 'failed'
                ELSE cl.status
              END as result
       FROM page_call_logs cl
       JOIN page_contacts c ON cl.contact_id = c.contact_id
       WHERE cl.campaign_id = $1
       ORDER BY cl.created_at DESC
       LIMIT 10`,
      [campaignId]
    );

    res.json({
      success: true,
      stats: statsResult.rows[0] || {},
      activeCampaign: activeCampaign ? {
        status: activeCampaign.status,
        currentCalls: activeCampaign.currentCalls,
        callsThisHour: activeCampaign.callsThisHour,
        lastCallTime: activeCampaign.lastCallTime,
        currentDialingContact: activeCampaign.currentDialingContact,
        contactsCalled: activeCampaign.contactsCalled,
        totalContacts: activeCampaign.totalContacts,
        connectedCalls: activeCampaign.connectedCalls,
        failedCalls: activeCampaign.failedCalls
      } : null,
      recent_calls: recentCalls.rows
    });

  } catch (error) {
    console.error('[Stats] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get campaign history for user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // Get campaigns with detailed stats
    const campaignsResult = await db.query(
      `SELECT 
        c.campaign_id,
        c.name,
        c.type,
        c.status,
        c.created_at,
        c.updated_at,
        c.total_contacts,
        COALESCE(c.contacts_called, 0) as contacts_called,
        COALESCE(c.connected_calls, 0) as connected_calls,
        COALESCE(c.failed_calls, 0) as failed_calls,
        COALESCE(c.voicemails, 0) as voicemails,
        COALESCE(c.qualified_leads, 0) as qualified_leads,
        COALESCE(c.converted_leads, 0) as converted_leads,
        COUNT(DISTINCT cl.call_id) as total_calls,
        COUNT(DISTINCT CASE WHEN cl.status = 'completed' AND cl.duration > 0 THEN cl.call_id END) as successful_calls
       FROM page_campaigns c
       LEFT JOIN page_call_logs cl ON c.campaign_id = cl.campaign_id
       WHERE c.created_by = $1
       GROUP BY c.campaign_id
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await db.query(
      `SELECT COUNT(*) as total
       FROM page_campaigns 
       WHERE created_by = $1`,
      [userId]
    );

    const totalCount = countResult.rows[0].total;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      campaigns: campaignsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('[Campaign History] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get detailed campaign report
router.get('/report/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Campaign details
    const campaignResult = await db.query(
      `SELECT * FROM page_campaigns WHERE campaign_id = $1`,
      [campaignId]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Call statistics
    const statsResult = await db.query(
      `SELECT 
        status,
        COUNT(*) as count,
        AVG(duration) as avg_duration
       FROM page_call_logs 
       WHERE campaign_id = $1 
       GROUP BY status`,
      [campaignId]
    );

    // Contact outcomes
    const outcomesResult = await db.query(
      `SELECT 
        call_result,
        COUNT(*) as count
       FROM page_campaign_contacts 
       WHERE campaign_id = $1 
       AND call_result IS NOT NULL
       GROUP BY call_result`,
      [campaignId]
    );

    // Timeline of calls
    const timelineResult = await db.query(
      `SELECT 
        DATE_TRUNC('hour', created_at) as hour,
        COUNT(*) as calls,
        COUNT(CASE WHEN status = 'completed' AND duration > 0 THEN 1 END) as connected
       FROM page_call_logs 
       WHERE campaign_id = $1 
       GROUP BY DATE_TRUNC('hour', created_at)
       ORDER BY hour`,
      [campaignId]
    );

    res.json({
      success: true,
      campaign: campaignResult.rows[0],
      call_stats: statsResult.rows,
      outcomes: outcomesResult.rows,
      timeline: timelineResult.rows
    });

  } catch (error) {
    console.error('[Campaign Report] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DEBUG & UTILITY ENDPOINTS
// ============================================

// Get all active campaigns
router.get('/active', (req, res) => {
  const active = Array.from(activeCampaigns.entries()).map(([id, campaign]) => ({
    campaign_id: id,
    name: campaign.name,
    status: campaign.status,
    currentCalls: campaign.currentCalls,
    contactsCalled: campaign.contactsCalled,
    totalContacts: campaign.totalContacts,
    currentDialingContact: campaign.currentDialingContact
  }));

  res.json({
    success: true,
    activeCampaigns: active
  });
});

// Get agent performance
router.get('/agent/performance/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    const performance = await db.query(
      `SELECT 
        COUNT(*) as total_calls,
        COUNT(CASE WHEN status = 'completed' AND duration > 0 THEN 1 END) as connected_calls,
        COUNT(CASE WHEN call_result = 'voicemail' THEN 1 END) as voicemails,
        COUNT(CASE WHEN disposition = 'qualified' THEN 1 END) as qualified_leads,
        COUNT(CASE WHEN disposition = 'converted' THEN 1 END) as converted_leads,
        AVG(duration) as avg_call_duration
       FROM page_call_logs 
       WHERE agent_id = $1 
       AND created_at >= CURRENT_DATE`,
      [agentId]
    );

    res.json({
      success: true,
      performance: performance.rows[0] || {}
    });

  } catch (error) {
    console.error('[Performance] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DEBUG: Test endpoint to manually trigger a call
router.post('/debug/test-call', async (req, res) => {
  try {
    const { campaignId } = req.body;
    
    const campaign = activeCampaigns.get(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found in active campaigns'
      });
    }

    console.log(`[DEBUG] Manually triggering call for campaign ${campaignId}`);
    
    // Get next contact
    const contact = await getNextContact(campaignId);
    if (!contact) {
      return res.json({
        success: false,
        error: 'No contacts available'
      });
    }

    // Make the call
    await initiateCall(campaignId, contact);

    res.json({
      success: true,
      message: 'Test call initiated',
      contact: {
        name: contact.name,
        phone: contact.phone
      }
    });

  } catch (error) {
    console.error('[DEBUG] Test call error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;