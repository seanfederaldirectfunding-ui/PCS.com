import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/dialer/analytics - Get dialer analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const campaignId = searchParams.get('campaign_id');

    // Build query for call logs
    let callQuery = supabase
      .from('call_logs')
      .select('*')
      .eq('user_id', user.id);

    if (startDate) {
      callQuery = callQuery.gte('started_at', startDate);
    }
    if (endDate) {
      callQuery = callQuery.lte('started_at', endDate);
    }
    if (campaignId) {
      callQuery = callQuery.eq('campaign_id', campaignId);
    }

    const { data: calls, error: callError } = await callQuery;

    if (callError) {
      console.error('Error fetching call analytics:', callError);
      return NextResponse.json({ error: callError.message }, { status: 500 });
    }

    // Calculate analytics
    const totalCalls = calls?.length || 0;
    const completedCalls = calls?.filter(c => c.status === 'completed').length || 0;
    const answeredCalls = calls?.filter(c => c.status === 'answered' || c.status === 'completed').length || 0;
    const failedCalls = calls?.filter(c => c.status === 'failed').length || 0;
    const busyCalls = calls?.filter(c => c.status === 'busy').length || 0;
    const noAnswerCalls = calls?.filter(c => c.status === 'no-answer').length || 0;

    const totalDuration = calls?.reduce((sum, call) => sum + (call.duration || 0), 0) || 0;
    const avgDuration = answeredCalls > 0 ? Math.round(totalDuration / answeredCalls) : 0;

    const answerRate = totalCalls > 0 ? ((answeredCalls / totalCalls) * 100).toFixed(2) : '0.00';
    const completionRate = totalCalls > 0 ? ((completedCalls / totalCalls) * 100).toFixed(2) : '0.00';

    // Call distribution by hour
    const callsByHour = Array(24).fill(0);
    calls?.forEach(call => {
      const hour = new Date(call.started_at).getHours();
      callsByHour[hour]++;
    });

    // Call distribution by status
    const callsByStatus = {
      initiated: calls?.filter(c => c.status === 'initiated').length || 0,
      ringing: calls?.filter(c => c.status === 'ringing').length || 0,
      answered: calls?.filter(c => c.status === 'answered').length || 0,
      completed: completedCalls,
      failed: failedCalls,
      busy: busyCalls,
      'no-answer': noAnswerCalls,
      canceled: calls?.filter(c => c.status === 'canceled').length || 0
    };

    // Recent calls
    const recentCalls = calls?.slice(0, 10) || [];

    const analytics = {
      overview: {
        totalCalls,
        answeredCalls,
        completedCalls,
        failedCalls,
        busyCalls,
        noAnswerCalls,
        totalDuration,
        avgDuration,
        answerRate: parseFloat(answerRate),
        completionRate: parseFloat(completionRate)
      },
      distribution: {
        byHour: callsByHour,
        byStatus: callsByStatus
      },
      recentCalls
    };

    return NextResponse.json({ analytics });
  } catch (error: any) {
    console.error('Error in GET /api/dialer/analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
