/**
 * Dialer Service
 * Handles call management, campaign operations, and analytics
 */

export interface Call {
  id: string;
  user_id: string;
  call_id?: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';
  duration?: number;
  recording_url?: string;
  notes?: string;
  lead_id?: string;
  campaign_id?: string;
  metadata?: Record<string, any>;
  started_at: string;
  answered_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'manual' | 'power' | 'predictive' | 'preview';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  caller_id?: string;
  script?: string;
  max_attempts: number;
  retry_interval: number;
  active_hours: { start: string; end: string };
  timezone: string;
  stats: {
    total: number;
    completed: number;
    pending?: number;
    failed?: number;
    answered?: number;
    no_answer?: number;
    busy?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CampaignContact {
  id: string;
  campaign_id: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  status: 'pending' | 'calling' | 'completed' | 'failed' | 'do-not-call' | 'callback';
  attempts: number;
  last_attempt_at?: string;
  next_attempt_at?: string;
  last_call_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CallDisposition {
  id: string;
  call_id: string;
  user_id: string;
  disposition: 'interested' | 'not-interested' | 'callback' | 'wrong-number' | 'no-answer' | 'voicemail' | 'do-not-call' | 'qualified' | 'not-qualified';
  notes?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface DialerAnalytics {
  overview: {
    totalCalls: number;
    answeredCalls: number;
    completedCalls: number;
    failedCalls: number;
    busyCalls: number;
    noAnswerCalls: number;
    totalDuration: number;
    avgDuration: number;
    answerRate: number;
    completionRate: number;
  };
  distribution: {
    byHour: number[];
    byStatus: Record<string, number>;
  };
  recentCalls: Call[];
}

class DialerService {
  private baseUrl = '/api/dialer';

  // ============ Call Management ============

  /**
   * Make a new outbound call
   */
  async makeCall(params: {
    to: string;
    from?: string;
    campaignId?: string;
    leadId?: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; call?: Call; callId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to make call' };
      }

      const data = await response.json();
      return { success: true, call: data.call, callId: data.callId };
    } catch (error: any) {
      console.error('Error making call:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all calls with optional filters
   */
  async getCalls(params?: {
    status?: string;
    direction?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ calls: Call[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.set('status', params.status);
      if (params?.direction) queryParams.set('direction', params.direction);
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.offset) queryParams.set('offset', params.offset.toString());

      const response = await fetch(`${this.baseUrl}/calls?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch calls');
      }

      const data = await response.json();
      return { calls: data.calls || [], total: data.total || 0 };
    } catch (error) {
      console.error('Error fetching calls:', error);
      return { calls: [], total: 0 };
    }
  }

  /**
   * Get specific call by ID
   */
  async getCall(id: string): Promise<Call | null> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${id}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.call;
    } catch (error) {
      console.error('Error fetching call:', error);
      return null;
    }
  }

  /**
   * Update call details
   */
  async updateCall(id: string, updates: Partial<Call>): Promise<Call | null> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.call;
    } catch (error) {
      console.error('Error updating call:', error);
      return null;
    }
  }

  /**
   * Delete call log
   */
  async deleteCall(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${id}`, {
        method: 'DELETE'
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting call:', error);
      return false;
    }
  }

  // ============ Campaign Management ============

  /**
   * Get all campaigns
   */
  async getCampaigns(params?: {
    status?: string;
    type?: string;
  }): Promise<Campaign[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.set('status', params.status);
      if (params?.type) queryParams.set('type', params.type);

      const response = await fetch(`${this.baseUrl}/campaigns?${queryParams}`);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.campaigns || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  /**
   * Create new campaign
   */
  async createCampaign(params: {
    name: string;
    description?: string;
    type?: 'manual' | 'power' | 'predictive' | 'preview';
    caller_id?: string;
    script?: string;
    max_attempts?: number;
    retry_interval?: number;
    active_hours?: { start: string; end: string };
    timezone?: string;
  }): Promise<Campaign | null> {
    try {
      const response = await fetch(`${this.baseUrl}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return null;
    }
  }

  /**
   * Get specific campaign
   */
  async getCampaign(id: string): Promise<Campaign | null> {
    try {
      const response = await fetch(`${this.baseUrl}/campaigns/${id}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.campaign;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    try {
      const response = await fetch(`${this.baseUrl}/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.campaign;
    } catch (error) {
      console.error('Error updating campaign:', error);
      return null;
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/campaigns/${id}`, {
        method: 'DELETE'
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
  }

  // ============ Campaign Contacts ============

  /**
   * Get contacts for a campaign
   */
  async getCampaignContacts(campaignId: string, status?: string): Promise<CampaignContact[]> {
    try {
      const queryParams = new URLSearchParams();
      if (status) queryParams.set('status', status);

      const response = await fetch(
        `${this.baseUrl}/campaigns/${campaignId}/contacts?${queryParams}`
      );
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.contacts || [];
    } catch (error) {
      console.error('Error fetching campaign contacts:', error);
      return [];
    }
  }

  /**
   * Add contacts to campaign
   */
  async addCampaignContacts(
    campaignId: string,
    contacts: Array<{
      phone_number: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      company?: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<CampaignContact[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/campaigns/${campaignId}/contacts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts })
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.contacts || [];
    } catch (error) {
      console.error('Error adding campaign contacts:', error);
      return [];
    }
  }

  // ============ Call Dispositions ============

  /**
   * Get dispositions for a call
   */
  async getDispositions(callId?: string): Promise<CallDisposition[]> {
    try {
      const queryParams = new URLSearchParams();
      if (callId) queryParams.set('call_id', callId);

      const response = await fetch(`${this.baseUrl}/dispositions?${queryParams}`);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.dispositions || [];
    } catch (error) {
      console.error('Error fetching dispositions:', error);
      return [];
    }
  }

  /**
   * Create disposition for a call
   */
  async createDisposition(params: {
    call_id: string;
    disposition: CallDisposition['disposition'];
    notes?: string;
    follow_up_date?: string;
  }): Promise<CallDisposition | null> {
    try {
      const response = await fetch(`${this.baseUrl}/dispositions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.disposition;
    } catch (error) {
      console.error('Error creating disposition:', error);
      return null;
    }
  }

  // ============ Analytics ============

  /**
   * Get dialer analytics
   */
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    campaign_id?: string;
  }): Promise<DialerAnalytics | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.start_date) queryParams.set('start_date', params.start_date);
      if (params?.end_date) queryParams.set('end_date', params.end_date);
      if (params?.campaign_id) queryParams.set('campaign_id', params.campaign_id);

      const response = await fetch(`${this.baseUrl}/analytics?${queryParams}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }
}

// Export singleton instance
export const dialerService = new DialerService();
export default dialerService;
