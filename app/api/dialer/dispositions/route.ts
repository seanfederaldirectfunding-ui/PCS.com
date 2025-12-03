import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/dialer/dispositions - List dispositions for a call
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('call_id');

    let query = supabase
      .from('call_dispositions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (callId) {
      query = query.eq('call_id', callId);
    }

    const { data: dispositions, error } = await query;

    if (error) {
      console.error('Error fetching dispositions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ dispositions });
  } catch (error: any) {
    console.error('Error in GET /api/dialer/dispositions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/dialer/dispositions - Create disposition for a call
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { call_id, disposition, notes, follow_up_date } = body;

    if (!call_id || !disposition) {
      return NextResponse.json(
        { error: 'call_id and disposition required' },
        { status: 400 }
      );
    }

    // Verify call ownership
    const { data: call } = await supabase
      .from('call_logs')
      .select('id')
      .eq('id', call_id)
      .eq('user_id', user.id)
      .single();

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('call_dispositions')
      .insert({
        call_id,
        user_id: user.id,
        disposition,
        notes,
        follow_up_date
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating disposition:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ disposition: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/dialer/dispositions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
