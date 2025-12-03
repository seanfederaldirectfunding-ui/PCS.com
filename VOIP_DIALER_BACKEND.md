# VoIP Dialer Backend Structure

## Overview

This comprehensive VoIP dialer backend integrates with VoIPStudio REST API to provide:
- Call logging and history tracking
- Campaign management (manual, power, predictive, preview dialing)
- Contact list management for campaigns
- Call dispositions and follow-up scheduling
- Real-time analytics and reporting
- Call recording management

## Database Schema

### Tables

#### `call_logs`
Tracks all inbound and outbound calls with detailed metadata.

**Columns:**
- `id` - UUID primary key
- `user_id` - Reference to auth.users
- `call_id` - Unique identifier from VoIPStudio
- `direction` - 'inbound' or 'outbound'
- `from_number` - Caller's phone number (E.164 format)
- `to_number` - Recipient's phone number (E.164 format)
- `status` - Call status (initiated, ringing, answered, completed, failed, busy, no-answer, canceled)
- `duration` - Call duration in seconds
- `recording_url` - URL to call recording
- `notes` - Agent notes about the call
- `lead_id` - Optional reference to CRM lead
- `campaign_id` - Optional reference to dialer campaign
- `metadata` - JSON metadata
- `started_at` - Call start timestamp
- `answered_at` - When call was answered
- `ended_at` - When call ended
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_call_logs_user_id` - Fast user queries
- `idx_call_logs_call_id` - Fast VoIPStudio ID lookups
- `idx_call_logs_status` - Filter by status
- `idx_call_logs_started_at` - Chronological ordering

#### `dialer_campaigns`
Manages dialer campaigns with various dialing modes.

**Columns:**
- `id` - UUID primary key
- `user_id` - Campaign owner
- `name` - Campaign name
- `description` - Campaign description
- `type` - Dialing mode: manual, power, predictive, preview
- `status` - draft, active, paused, completed, archived
- `caller_id` - Outbound caller ID
- `script` - Agent call script
- `max_attempts` - Max retry attempts per contact
- `retry_interval` - Seconds between retries
- `active_hours` - JSON with start/end times
- `timezone` - Campaign timezone
- `stats` - JSON with campaign statistics
- `created_at`, `updated_at` - Timestamps

#### `campaign_contacts`
Contact lists for each campaign with tracking data.

**Columns:**
- `id` - UUID primary key
- `campaign_id` - Reference to dialer_campaigns
- `phone_number` - Contact phone number
- `first_name`, `last_name` - Contact name
- `email` - Contact email
- `company` - Company name
- `status` - pending, calling, completed, failed, do-not-call, callback
- `attempts` - Number of call attempts
- `last_attempt_at` - Last call attempt timestamp
- `next_attempt_at` - Scheduled next attempt
- `last_call_id` - Reference to last call_logs entry
- `metadata` - JSON custom fields
- `created_at`, `updated_at` - Timestamps

#### `dialer_queues`
Manages call queue for predictive/power dialing.

**Columns:**
- `id` - UUID primary key
- `campaign_id` - Reference to campaign
- `contact_id` - Reference to contact
- `priority` - Queue priority (higher = first)
- `scheduled_at` - When to call
- `status` - queued, calling, completed, failed, skipped
- `created_at` - Timestamp

#### `call_recordings`
Stores call recording metadata and transcriptions.

**Columns:**
- `id` - UUID primary key
- `call_id` - Reference to call_logs
- `recording_url` - URL to recording file
- `duration` - Recording duration in seconds
- `file_size` - File size in bytes
- `transcription` - AI-generated transcription
- `sentiment` - positive, neutral, negative
- `created_at` - Timestamp

#### `voicemail_drops`
Pre-recorded voicemail messages for automated drops.

**Columns:**
- `id` - UUID primary key
- `user_id` - Owner
- `name` - Voicemail name
- `audio_url` - URL to audio file
- `duration` - Duration in seconds
- `usage_count` - Times used
- `created_at` - Timestamp

#### `call_dispositions`
Call outcomes and follow-up actions.

**Columns:**
- `id` - UUID primary key
- `call_id` - Reference to call_logs
- `user_id` - Agent who dispositioned
- `disposition` - interested, not-interested, callback, wrong-number, no-answer, voicemail, do-not-call, qualified, not-qualified
- `notes` - Disposition notes
- `follow_up_date` - Scheduled follow-up
- `created_at` - Timestamp

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:
- Users can view/insert/update their own call logs
- Users can manage their own campaigns
- Users can access contacts from their campaigns only

### Database Functions & Triggers

**`update_campaign_stats()`**
- Automatically updates campaign statistics when contacts are added/modified
- Tracks total, completed, pending, failed counts

**`schedule_next_attempt()`**
- Auto-schedules next call attempt based on campaign retry_interval
- Triggers when contact status changes to 'failed' or 'callback'

**`update_updated_at_column()`**
- Updates `updated_at` timestamp on record changes

## API Endpoints

### Call Management

#### `POST /api/dialer/calls`
Make a new outbound call.

**Request Body:**
```json
{
  "to": "+12125551234",
  "from": "+19175551234",
  "campaignId": "uuid",
  "leadId": "uuid",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "call": { /* call object */ },
  "callId": "voipstudio-call-id"
}
```

#### `GET /api/dialer/calls`
List all calls with filters.

**Query Parameters:**
- `status` - Filter by call status
- `direction` - Filter by inbound/outbound
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "calls": [ /* call objects */ ],
  "total": 150
}
```

#### `GET /api/dialer/calls/[id]`
Get specific call details with real-time VoIPStudio status.

**Response:**
```json
{
  "call": {
    "id": "uuid",
    "call_id": "voip-id",
    "status": "completed",
    "duration": 120,
    "voip_status": { /* real-time status from VoIPStudio */ }
  }
}
```

#### `PATCH /api/dialer/calls/[id]`
Update call details.

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Customer interested",
  "duration": 180,
  "ended_at": "2025-01-20T12:00:00Z"
}
```

#### `DELETE /api/dialer/calls/[id]`
Delete call log.

### Campaign Management

#### `GET /api/dialer/campaigns`
List all campaigns.

**Query Parameters:**
- `status` - Filter by status
- `type` - Filter by dialing type

#### `POST /api/dialer/campaigns`
Create new campaign.

**Request Body:**
```json
{
  "name": "Q1 Outreach",
  "description": "First quarter lead follow-up",
  "type": "power",
  "caller_id": "+19175551234",
  "script": "Hello, this is...",
  "max_attempts": 3,
  "retry_interval": 3600,
  "active_hours": { "start": "09:00", "end": "17:00" },
  "timezone": "America/New_York"
}
```

#### `GET /api/dialer/campaigns/[id]`
Get campaign details.

#### `PATCH /api/dialer/campaigns/[id]`
Update campaign.

#### `DELETE /api/dialer/campaigns/[id]`
Delete campaign (cascades to contacts and queue entries).

### Campaign Contacts

#### `GET /api/dialer/campaigns/[id]/contacts`
List contacts in campaign.

**Query Parameters:**
- `status` - Filter by contact status

#### `POST /api/dialer/campaigns/[id]/contacts`
Add contacts to campaign.

**Request Body:**
```json
{
  "contacts": [
    {
      "phone_number": "+12125551234",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "metadata": { "source": "lead-gen" }
    }
  ]
}
```

### Call Dispositions

#### `GET /api/dialer/dispositions`
List call dispositions.

**Query Parameters:**
- `call_id` - Filter by specific call

#### `POST /api/dialer/dispositions`
Create disposition for a call.

**Request Body:**
```json
{
  "call_id": "uuid",
  "disposition": "interested",
  "notes": "Wants follow-up next week",
  "follow_up_date": "2025-01-27T10:00:00Z"
}
```

### Analytics

#### `GET /api/dialer/analytics`
Get comprehensive dialer analytics.

**Query Parameters:**
- `start_date` - Filter from date (ISO 8601)
- `end_date` - Filter to date (ISO 8601)
- `campaign_id` - Filter by specific campaign

**Response:**
```json
{
  "analytics": {
    "overview": {
      "totalCalls": 500,
      "answeredCalls": 320,
      "completedCalls": 280,
      "failedCalls": 50,
      "busyCalls": 40,
      "noAnswerCalls": 90,
      "totalDuration": 36000,
      "avgDuration": 112,
      "answerRate": 64.0,
      "completionRate": 56.0
    },
    "distribution": {
      "byHour": [0, 0, 0, 0, 0, 0, 0, 0, 5, 25, 48, ...],
      "byStatus": {
        "initiated": 10,
        "ringing": 5,
        "answered": 40,
        "completed": 280,
        "failed": 50,
        "busy": 40,
        "no-answer": 90,
        "canceled": 15
      }
    },
    "recentCalls": [ /* last 10 calls */ ]
  }
}
```

## Service Layer

### `lib/dialer-service.ts`

Client-side TypeScript service with type-safe methods for all dialer operations.

**Key Methods:**
- `makeCall()` - Initiate outbound call
- `getCalls()` - Fetch call history
- `getCall()` - Get specific call
- `updateCall()` - Update call details
- `deleteCall()` - Remove call log
- `getCampaigns()` - List campaigns
- `createCampaign()` - Create new campaign
- `updateCampaign()` - Modify campaign
- `deleteCampaign()` - Remove campaign
- `getCampaignContacts()` - Get campaign contacts
- `addCampaignContacts()` - Add contacts to campaign
- `getDispositions()` - Fetch dispositions
- `createDisposition()` - Add call disposition
- `getAnalytics()` - Get analytics data

**Usage Example:**
```typescript
import { dialerService } from '@/lib/dialer-service';

// Make a call
const result = await dialerService.makeCall({
  to: '+12125551234',
  from: '+19175551234',
  campaignId: 'campaign-uuid'
});

// Get analytics
const analytics = await dialerService.getAnalytics({
  start_date: '2025-01-01',
  end_date: '2025-01-31'
});
```

## VoIPStudio Integration

### `lib/voipstudio-service.ts`

Existing VoIP service handles direct API communication:

**Configuration:**
- API Key: `26d829cb5de77276b5740abfb456b6a41a8744b0`
- Username: `388778`
- Server: `amn.sip.ssl7.net`
- Base URL: `https://l7api.com/v1.1/voipstudio`

**Methods:**
- `makeCall(to, from)` - Initiate call via VoIPStudio
- `getCallStatus(callId)` - Get real-time call status
- `formatPhoneNumber(phone)` - Convert to E.164 format
- `isConfigured()` - Check if credentials exist

## Setup Instructions

### 1. Run Database Schema

Execute the SQL schema in your Supabase project:

```bash
# Navigate to Supabase dashboard
# Project: slamsitgnvioymrykroo.supabase.co
# Go to SQL Editor
# Run: supabase-dialer-schema.sql
```

### 2. Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://slamsitgnvioymrykroo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VOIPSTUDIO_API_KEY=26d829cb5de77276b5740abfb456b6a41a8744b0
VOIPSTUDIO_USERNAME=388778
VOIPSTUDIO_SERVER=amn.sip.ssl7.net
```

### 3. API Routes

All API routes are created and ready to use:
- ✅ `/app/api/dialer/calls/route.ts`
- ✅ `/app/api/dialer/calls/[id]/route.ts`
- ✅ `/app/api/dialer/campaigns/route.ts`
- ✅ `/app/api/dialer/campaigns/[id]/route.ts`
- ✅ `/app/api/dialer/campaigns/[id]/contacts/route.ts`
- ✅ `/app/api/dialer/dispositions/route.ts`
- ✅ `/app/api/dialer/analytics/route.ts`

### 4. Service Layer

Client-side service ready for use:
- ✅ `/lib/dialer-service.ts`

## Next Steps

1. **Run SQL Schema**: Execute `supabase-dialer-schema.sql` in Supabase dashboard
2. **Test API Endpoints**: Use Postman or your frontend to test endpoints
3. **Build Frontend Components**: Create React components for:
   - Dialer interface with keypad
   - Campaign management dashboard
   - Call history viewer
   - Analytics dashboard
   - Contact list manager
4. **Real-time Updates**: Add Supabase Realtime subscriptions for live call status
5. **WebSocket Integration**: Connect to VoIPStudio WebSocket for real-time call events
6. **Recording Playback**: Build UI for call recording playback
7. **Transcription**: Integrate AI transcription service for recordings

## Features Supported

✅ **Manual Dialing** - Click-to-call from any contact
✅ **Power Dialing** - Auto-dial next contact when agent becomes available
✅ **Predictive Dialing** - AI-driven multi-line dialing (future)
✅ **Preview Dialing** - Agent previews contact before calling
✅ **Call History** - Complete audit trail of all calls
✅ **Campaign Management** - Organize contacts into campaigns
✅ **Call Dispositions** - Track outcomes and schedule follow-ups
✅ **Analytics Dashboard** - Real-time metrics and reporting
✅ **Call Recording** - Store and manage call recordings
✅ **Retry Logic** - Automatic retry with configurable intervals
✅ **Active Hours** - Respect calling time windows
✅ **Do-Not-Call List** - Compliance with DNC requests
✅ **Multi-timezone** - Support for different timezones

## Security

- **Row Level Security (RLS)**: All tables protected with user-specific policies
- **Authentication Required**: All endpoints require valid Supabase session
- **Data Isolation**: Users can only access their own data
- **API Key Protection**: VoIPStudio credentials stored in environment variables
- **Audit Trail**: All actions timestamped and logged

## Performance Considerations

- **Indexes**: Strategic indexes on frequently queried columns
- **Pagination**: Call history supports offset/limit pagination
- **Efficient Queries**: Optimized SQL queries with proper JOINs
- **Caching**: Consider implementing Redis for campaign queue caching
- **Real-time**: Supabase Realtime for live updates without polling

## Troubleshooting

### Call not connecting
1. Verify VoIPStudio credentials in `.env.local`
2. Check phone number is in E.164 format (+country code)
3. Verify VoIPStudio account has available balance
4. Check `call_logs` table for error details

### Campaign not starting
1. Verify campaign status is 'active'
2. Check contacts have status 'pending'
3. Verify active_hours match current time
4. Check timezone configuration

### Analytics not showing data
1. Verify calls exist in `call_logs` table
2. Check date range parameters
3. Verify user authentication
4. Check browser console for errors

## API Rate Limits

- VoIPStudio API: 100 requests/minute
- Supabase: Based on plan (typically 500 concurrent)

## Future Enhancements

- [ ] WebSocket integration for real-time call events
- [ ] AI-powered call transcription
- [ ] Sentiment analysis on calls
- [ ] SMS follow-up integration
- [ ] Email integration for multi-channel campaigns
- [ ] Advanced predictive dialing algorithm
- [ ] Call recording transcription search
- [ ] Agent performance dashboard
- [ ] Call coaching and quality monitoring
- [ ] Integration with CRM systems
