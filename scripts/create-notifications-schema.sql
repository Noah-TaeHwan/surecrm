-- Notifications Feature 스키마 생성
-- 먼저 기본 스키마부터 생성

-- Enum 타입들 생성
CREATE TYPE user_role AS ENUM ('agent', 'team_admin', 'system_admin');
CREATE TYPE importance AS ENUM ('high', 'medium', 'low');
CREATE TYPE gender AS ENUM ('male', 'female');
CREATE TYPE insurance_type AS ENUM ('life', 'health', 'auto', 'prenatal', 'property', 'other');
CREATE TYPE meeting_type AS ENUM ('first_consultation', 'product_explanation', 'contract_review', 'follow_up', 'other');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE referral_status AS ENUM ('active', 'inactive');
CREATE TYPE document_type AS ENUM ('policy', 'id_card', 'vehicle_registration', 'vehicle_photo', 'dashboard_photo', 'license_plate_photo', 'blackbox_photo', 'insurance_policy_photo', 'other');
CREATE TYPE invitation_status AS ENUM ('pending', 'used', 'expired', 'cancelled');

-- Notifications 특화 Enum들
CREATE TYPE notification_type AS ENUM (
  'meeting_reminder',
  'goal_achievement', 
  'goal_deadline',
  'new_referral',
  'client_milestone',
  'team_update',
  'system_alert',
  'birthday_reminder',
  'follow_up_reminder',
  'contract_expiry',
  'payment_due'
);

CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms', 'push', 'kakao');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed', 'cancelled');

-- 기본 테이블들 생성 (순서 중요)

-- Teams 테이블 (admin_id 없이 먼저 생성)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles 테이블 (auth.users 확장)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  company TEXT,
  role user_role NOT NULL DEFAULT 'agent',
  team_id UUID REFERENCES teams(id),
  invited_by_id UUID REFERENCES profiles(id),
  invitations_left INTEGER NOT NULL DEFAULT 2,
  google_calendar_token JSONB,
  settings JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Teams 테이블에 admin_id 추가
ALTER TABLE teams ADD COLUMN admin_id UUID REFERENCES profiles(id);

-- Pipeline Stages 테이블
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK ((agent_id IS NULL AND team_id IS NOT NULL) OR (agent_id IS NOT NULL AND team_id IS NULL))
);

-- Clients 테이블
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES profiles(id) NOT NULL,
  team_id UUID REFERENCES teams(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  telecom_provider TEXT,
  address TEXT,
  occupation TEXT,
  has_driving_license BOOLEAN,
  height INTEGER,
  weight INTEGER,
  tags TEXT[],
  importance importance NOT NULL DEFAULT 'medium',
  current_stage_id UUID REFERENCES pipeline_stages(id) NOT NULL,
  referred_by_id UUID REFERENCES clients(id),
  notes TEXT,
  custom_fields JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (agent_id, full_name, phone)
);

-- Meetings 테이블
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  agent_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  meeting_type meeting_type NOT NULL,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  google_event_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Notifications 특화 테이블들

-- Notification Settings 테이블
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id),
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  kakao_notifications BOOLEAN NOT NULL DEFAULT false,
  meeting_reminders BOOLEAN NOT NULL DEFAULT true,
  goal_deadlines BOOLEAN NOT NULL DEFAULT true,
  new_referrals BOOLEAN NOT NULL DEFAULT true,
  client_milestones BOOLEAN NOT NULL DEFAULT true,
  team_updates BOOLEAN NOT NULL DEFAULT true,
  system_alerts BOOLEAN NOT NULL DEFAULT true,
  birthday_reminders BOOLEAN NOT NULL DEFAULT true,
  follow_up_reminders BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '08:00',
  weekend_notifications BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification Templates 테이블
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  name TEXT NOT NULL,
  subject TEXT,
  body_template TEXT NOT NULL,
  variables JSONB,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification Queue 테이블
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  template_id UUID REFERENCES notification_templates(id),
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  status notification_status NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification History 테이블
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  queue_id UUID REFERENCES notification_queue(id),
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  status notification_status NOT NULL,
  response_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification Rules 테이블
CREATE TABLE notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification Subscriptions 테이블
CREATE TABLE notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  notification_types TEXT[] NOT NULL,
  channels TEXT[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_profiles_team_id ON profiles(team_id);
CREATE INDEX idx_clients_agent_id ON clients(agent_id);
CREATE INDEX idx_clients_team_id ON clients(team_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_agent_id ON meetings(agent_id);
CREATE INDEX idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_queue_scheduled_at ON notification_queue(scheduled_at);
CREATE INDEX idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX idx_notification_rules_user_id ON notification_rules(user_id);
CREATE INDEX idx_notification_subscriptions_user_id ON notification_subscriptions(user_id);

-- JSONB 인덱스
CREATE INDEX idx_notification_templates_variables ON notification_templates USING gin (variables);
CREATE INDEX idx_notification_queue_metadata ON notification_queue USING gin (metadata);

-- 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notification_rules_updated_at BEFORE UPDATE ON notification_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notification_subscriptions_updated_at BEFORE UPDATE ON notification_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- 기본 RLS 정책들
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own notifications" ON notification_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notification_queue
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notification_queue
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notification history" ON notification_history
  FOR SELECT USING (auth.uid() = user_id);

-- 성공 메시지
SELECT 'Notifications 스키마가 성공적으로 생성되었습니다!' as message; 