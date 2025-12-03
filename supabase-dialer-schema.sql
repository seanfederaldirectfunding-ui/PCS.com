-- VoIP Dialer Database Schema

-- Call logs table
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  call_id TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'answered', 'completed', 'failed', 'busy', 'no-answer', 'canceled')),
  duration INTEGER DEFAULT 0, -- in seconds
  recording_url TEXT,
  notes TEXT,
  lead_id UUID,
  campaign_id UUID,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dialer campaigns table
CREATE TABLE IF NOT EXISTS public.dialer_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'manual' CHECK (type IN ('manual', 'power', 'predictive', 'preview')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  caller_id TEXT,
  script TEXT,
  max_attempts INTEGER DEFAULT 3,
  retry_interval INTEGER DEFAULT 3600, -- in seconds
  active_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}',
  timezone TEXT DEFAULT 'America/New_York',
  stats JSONB DEFAULT '{"total": 0, "completed": 0, "answered": 0, "no_answer": 0, "busy": 0, "failed": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign contacts table
CREATE TABLE IF NOT EXISTS public.campaign_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.dialer_campaigns(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  company TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calling', 'completed', 'failed', 'do-not-call', 'callback')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_attempt_at TIMESTAMP WITH TIME ZONE,
  last_call_id UUID REFERENCES public.call_logs(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dialer queues table (for predictive/power dialing)
CREATE TABLE IF NOT EXISTS public.dialer_queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.dialer_campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.campaign_contacts(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'calling', 'completed', 'failed', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call recordings table
CREATE TABLE IF NOT EXISTS public.call_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES public.call_logs(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  duration INTEGER,
  file_size INTEGER,
  transcription TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voicemail drops table
CREATE TABLE IF NOT EXISTS public.voicemail_drops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call dispositions table
CREATE TABLE IF NOT EXISTS public.call_dispositions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES public.call_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  disposition TEXT NOT NULL CHECK (disposition IN ('interested', 'not-interested', 'callback', 'wrong-number', 'no-answer', 'voicemail', 'do-not-call', 'qualified', 'not-qualified')),
  notes TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialer_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialer_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voicemail_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_dispositions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_logs
CREATE POLICY "Users can view their own call logs"
  ON public.call_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own call logs"
  ON public.call_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own call logs"
  ON public.call_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for dialer_campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.dialer_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON public.dialer_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.dialer_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.dialer_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for campaign_contacts
CREATE POLICY "Users can view contacts from their campaigns"
  ON public.campaign_contacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.dialer_campaigns
    WHERE dialer_campaigns.id = campaign_contacts.campaign_id
    AND dialer_campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert contacts to their campaigns"
  ON public.campaign_contacts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.dialer_campaigns
    WHERE dialer_campaigns.id = campaign_contacts.campaign_id
    AND dialer_campaigns.user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON public.call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON public.call_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON public.call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON public.call_logs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_dialer_campaigns_user_id ON public.dialer_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_dialer_campaigns_status ON public.dialer_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_id ON public.campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_status ON public.campaign_contacts(status);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_phone ON public.campaign_contacts(phone_number);

CREATE INDEX IF NOT EXISTS idx_dialer_queues_campaign_id ON public.dialer_queues(campaign_id);
CREATE INDEX IF NOT EXISTS idx_dialer_queues_status ON public.dialer_queues(status);
CREATE INDEX IF NOT EXISTS idx_dialer_queues_scheduled_at ON public.dialer_queues(scheduled_at);

-- Function to update campaign stats
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.dialer_campaigns
  SET stats = jsonb_build_object(
    'total', (SELECT COUNT(*) FROM public.campaign_contacts WHERE campaign_id = NEW.campaign_id),
    'completed', (SELECT COUNT(*) FROM public.campaign_contacts WHERE campaign_id = NEW.campaign_id AND status = 'completed'),
    'pending', (SELECT COUNT(*) FROM public.campaign_contacts WHERE campaign_id = NEW.campaign_id AND status = 'pending'),
    'failed', (SELECT COUNT(*) FROM public.campaign_contacts WHERE campaign_id = NEW.campaign_id AND status = 'failed')
  ),
  updated_at = NOW()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update campaign stats
CREATE TRIGGER on_contact_status_change
  AFTER INSERT OR UPDATE OF status ON public.campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();

-- Function to auto-schedule next attempt
CREATE OR REPLACE FUNCTION schedule_next_attempt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'failed' OR NEW.status = 'callback' THEN
    UPDATE public.campaign_contacts
    SET next_attempt_at = NOW() + (
      SELECT retry_interval * INTERVAL '1 second'
      FROM public.dialer_campaigns
      WHERE id = NEW.campaign_id
    )
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-scheduling
CREATE TRIGGER on_attempt_failed
  AFTER UPDATE OF status ON public.campaign_contacts
  FOR EACH ROW
  WHEN (NEW.status IN ('failed', 'callback'))
  EXECUTE FUNCTION schedule_next_attempt();

-- Updated_at triggers
CREATE TRIGGER update_call_logs_updated_at
  BEFORE UPDATE ON public.call_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dialer_campaigns_updated_at
  BEFORE UPDATE ON public.dialer_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_contacts_updated_at
  BEFORE UPDATE ON public.campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
