import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/dialer/campaigns/[id]/contacts - List campaign contacts
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Verify campaign ownership
    const { data: campaign } = await supabase
      .from('dialer_campaigns')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    let query = supabase
      .from('campaign_contacts')
      .select('*')
      .eq('campaign_id', params.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: contacts, error } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contacts });
  } catch (error: any) {
    console.error('Error in GET /api/dialer/campaigns/[id]/contacts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/dialer/campaigns/[id]/contacts - Add contacts to campaign
export async function POST(
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

    // Verify campaign ownership
    const { data: campaign } = await supabase
      .from('dialer_campaigns')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const body = await request.json();
    const { contacts } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'Contacts array required' }, { status: 400 });
    }

    // Add campaign_id to each contact
    const contactsToInsert = contacts.map(contact => ({
      ...contact,
      campaign_id: params.id,
      status: 'pending'
    }));

    const { data, error } = await supabase
      .from('campaign_contacts')
      .insert(contactsToInsert)
      .select();

    if (error) {
      console.error('Error adding contacts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contacts: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/dialer/campaigns/[id]/contacts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
