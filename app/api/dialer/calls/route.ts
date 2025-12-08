import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { voipService } from '@/lib/voipstudio-service';

export const dynamic = 'force-dynamic';

// GET /api/dialer/calls - List call logs
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const direction = searchParams.get('direction');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('call_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (direction) {
      query = query.eq('direction', direction);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching calls:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ calls: data, total: count });
  } catch (error: any) {
    console.error('Error in GET /api/dialer/calls:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/dialer/calls - Make a new call
export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.VOIPSTUDIO_API_KEY) {
      console.error('[Dialer] Missing VOIPSTUDIO_API_KEY environment variable');
      return NextResponse.json({ 
        error: 'VoIP service not configured. Missing API key.' 
      }, { status: 500 });
    }

    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, from, campaignId, leadId, metadata } = body;

    if (!to) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    if (!from) {
      return NextResponse.json({ error: 'Caller ID required' }, { status: 400 });
    }

    console.log('[Dialer] Initiating call:', { to, from, user: user.id });

    // Make the call via VoIPStudio
    const callResult = await voipService.makeCall({ to, from });

    if (!callResult.success) {
      console.error('[Dialer] Call failed:', callResult.error);
      return NextResponse.json({ error: callResult.error }, { status: 500 });
    }

    console.log('[Dialer] Call initiated successfully:', callResult.callId);

    // Create call log entry
    const { data: callLog, error: dbError } = await supabase
      .from('call_logs')
      .insert({
        user_id: user.id,
        call_id: callResult.callId,
        direction: 'outbound',
        from_number: from || '',
        to_number: to,
        status: 'initiated',
        campaign_id: campaignId || null,
        lead_id: leadId || null,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error creating call log:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      call: callLog,
      callId: callResult.callId
    });
  } catch (error: any) {
    console.error('Error in POST /api/dialer/calls:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
