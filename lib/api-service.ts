import axios from 'axios';

const API_BASE_URL = 'https://api.xxxxx.xxxx/api/page';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('page_token');
    const userId = localStorage.getItem('page_userId');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (userId) {
      config.headers['User-Id'] = userId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('page_token');
      localStorage.removeItem('page_userId');
      localStorage.removeItem('page_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; phone: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { identifier: string; password: string }) =>
    api.post('/auth/login', data),
};

// Contacts API
export const contactsAPI = {
  getContacts: (params: { 
    userId: string; 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string;
  }) => api.get('/contacts', { params }),
  
  uploadContacts: (data: { userId: string; contacts: any[] }) =>
    api.post('/contacts/upload', data),
  
  updateContactStatus: (contactId: string, data: { status: string; notes?: string }) =>
    api.patch(`/contacts/${contactId}/status`, data),
  
  deleteContacts: (data: { userId: string; contactIds: string[] }) =>
    api.delete('/contacts/batch', { data }),

  assignContacts: (data: { userId: string; contactIds: string[]; assignTo: "ai" | "human" }) =>
    api.post('/contacts/assign', data),
  
  getStats: (userId: string) =>
    api.get(`/contacts/stats?userId=${userId}`),
};

// Campaign API
export const campaignAPI = {
  // Create campaign
  create: (data: {
    name: string;
    type: string;
    contactIds: string[];
    callsPerHour: number;
    maxConcurrentCalls: number;
    amdEnabled: boolean;
    voicemailAction: string;
    voicemailMessageId?: string | null;
  }) => api.post('/dialer/campaign/create', data),

  // Start campaign
  start: (data: { campaignId: string; agentId: string }) =>
    api.post('/dialer/campaign/start', data),

  // Pause campaign
  pause: (data: { campaignId: string }) =>
    api.post('/dialer/campaign/pause', data),

  // Resume campaign
  resume: (data: { campaignId: string }) =>
    api.post('/dialer/campaign/resume', data),

  // Stop campaign
  stop: (data: { campaignId: string }) =>
    api.post('/dialer/campaign/stop', data),

  // Get campaign stats
  getStats: (campaignId: string) =>
    api.get(`/dialer/campaign/stats/${campaignId}`),

  // Get campaign history
  getHistory: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/dialer/campaign/history/${userId}`, { params }),

  // Get campaign report
  getReport: (campaignId: string) =>
    api.get(`/dialer/campaign/report/${campaignId}`),

  // Agent join campaign
  agentJoin: (data: { campaignId: string; agentId: string }) =>
    api.post('/dialer/campaign/agent/join', data),

  // Agent leave campaign
  agentLeave: (data: { agentId: string }) =>
    api.post('/dialer/campaign/agent/leave', data),

  // Call disposition
  callDisposition: (data: { 
    callSid: string; 
    disposition: string; 
    notes?: string; 
    agentId: string;
  }) => api.post('/dialer/campaign/call/disposition', data),

  // Get voicemail messages
  getVoicemailMessages: () =>
    api.get('/dialer/voicemail/messages'),

  // Create voicemail message
  createVoicemailMessage: (formData: FormData) =>
    api.post('/dialer/voicemail/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Delete voicemail message
  deleteVoicemailMessage: (messageId: string) =>
    api.delete(`/dialer/voicemail/${messageId}`),

  // Agent performance
  getAgentPerformance: (agentId: string) =>
    api.get(`/dialer/campaign/agent/performance/${agentId}`),

  hangupCall: (data: { callSid: string; campaignId: string }) =>
    api.post('/dialer/campaign/call/hangup', data),

  // Get active calls
  getActiveCalls: (campaignId: string) =>
    api.get(`/dialer/campaign/calls/active/${campaignId}`),
};

// Dialer API (for manual browser calling)
export const dialerAPI = {
  getToken: (userId: string) =>
    api.get(`/dialer/token?userId=${userId}`),
  
  logCall: (data: { userId: string; phoneNumber: string; callSid: string }) =>
    api.post('/dialer/log-call', data),
};

export default api;