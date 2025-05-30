// 🎯 통합 스키마 파일: Drizzle 설정 및 전체 앱에서 사용

// ===== Core Schema (핵심 공유 테이블들) =====
export * from './core';

// ===== Public Schema (공개 페이지 관련) =====
export * from './public';

// ===== 통합 스키마 객체 (Drizzle 설정용) =====
import {
  // Core 테이블들
  authUsers,
  profiles,
  teams,
  clients,
  clientDetails,
  insuranceInfo,
  referrals,
  meetings,
  invitations,
  documents,
  pipelineStages,
  // Core Relations
  profilesRelations,
  teamsRelations,
  clientsRelations,
  clientDetailsRelations,
  insuranceInfoRelations,
  referralsRelations,
  meetingsRelations,
  invitationsRelations,
  documentsRelations,
  pipelineStagesRelations,
} from './core';

import {
  // Public 테이블들
  publicContents,
  faqs,
  announcements,
  testimonials,
  siteSettings,
  pageViews,
  // Public Relations
  publicContentsRelations,
  faqsRelations,
  announcementsRelations,
  testimonialsRelations,
  siteSettingsRelations,
  pageViewsRelations,
} from './public';

// Drizzle 설정용 통합 스키마
export const schema = {
  // ===== Core 테이블들 =====
  authUsers,
  profiles,
  teams,
  clients,
  clientDetails,
  insuranceInfo,
  referrals,
  meetings,
  invitations,
  documents,
  pipelineStages,

  // ===== Public 테이블들 =====
  publicContents,
  faqs,
  announcements,
  testimonials,
  siteSettings,
  pageViews,

  // ===== Relations =====
  profilesRelations,
  teamsRelations,
  clientsRelations,
  clientDetailsRelations,
  insuranceInfoRelations,
  referralsRelations,
  meetingsRelations,
  invitationsRelations,
  documentsRelations,
  pipelineStagesRelations,
  publicContentsRelations,
  faqsRelations,
  announcementsRelations,
  testimonialsRelations,
  siteSettingsRelations,
  pageViewsRelations,
};

// 타입 정의
export type Schema = typeof schema;

// ===== SQL 트리거 (Supabase Auth 연동) =====
export const authTriggerSQL = `
-- 새 사용자가 auth.users에 생성될 때 profiles 테이블에 자동으로 레코드 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS 정책 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 프로필 접근 정책
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 클라이언트 접근 정책
CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Users can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = agent_id);
`;
