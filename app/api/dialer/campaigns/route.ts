import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/dialer/campaigns - List campaigns
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
    const type = searchParams.get('type');

    let query = supabase
      .from('dialer_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Error in GET /api/dialer/campaigns:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/dialer/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type = 'manual',
      caller_id,
      script,
      max_attempts = 3,
      retry_interval = 3600,
      active_hours,
      timezone = 'America/New_York'
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Campaign name required' }, { status: 400 });
    }

    const { data: campaign, error } = await supabase
      .from('dialer_campaigns')
      .insert({
        user_id: user.id,
        name,
        description,
        type,
        status: 'draft',
        caller_id,
        script,
        max_attempts,
        retry_interval,
        active_hours: active_hours || { start: '09:00', end: '17:00' },
        timezone
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/dialer/campaigns:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
