import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { voipService } from '@/lib/voipstudio-service';

export const dynamic = 'force-dynamic';

// GET /api/dialer/calls/[id] - Get call details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: call, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching call:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Get real-time status from VoIPStudio if call_id exists
    if (call.call_id) {
      const status = await voipService.getCallStatus(call.call_id);
      if (status) {
        call.voip_status = status;
      }
    }

    return NextResponse.json({ call });
  } catch (error: any) {
    console.error('Error in GET /api/dialer/calls/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/dialer/calls/[id] - Update call details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, notes, duration, answered_at, ended_at, recording_url, metadata } = body;

    const updates: any = { updated_at: new Date().toISOString() };
    
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (duration !== undefined) updates.duration = duration;
    if (answered_at) updates.answered_at = answered_at;
    if (ended_at) updates.ended_at = ended_at;
    if (recording_url) updates.recording_url = recording_url;
    if (metadata) updates.metadata = metadata;

    const { data: call, error } = await supabase
      .from('call_logs')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating call:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ call });
  } catch (error: any) {
    console.error('Error in PATCH /api/dialer/calls/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/dialer/calls/[id] - Delete call log
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('call_logs')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting call:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/dialer/calls/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
