import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/contacts/import - Bulk import contacts
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contacts } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'Contacts array is required' }, { status: 400 });
    }

    // Validate each contact has at least a phone number
    const invalidContacts = contacts.filter(c => !c.phone);
    if (invalidContacts.length > 0) {
      return NextResponse.json({ 
        error: `${invalidContacts.length} contacts missing phone numbers` 
      }, { status: 400 });
    }

    // Add user_id to all contacts
    const contactsToInsert = contacts.map(contact => ({
      ...contact,
      user_id: user.id
    }));

    // Batch insert
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactsToInsert)
      .select();

    if (error) {
      console.error('Error importing contacts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      imported: data?.length || 0,
      contacts: data 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/contacts/import:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
