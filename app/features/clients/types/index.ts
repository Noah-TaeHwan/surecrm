// 📋 Clients 기능 전용 타입 정의
// Prefix 네이밍 컨벤션: client_ 사용

// 클라이언트 기본 타입 (schema와 일치)
export interface Client {
  id: string;
  agentId: string;
  teamId?: string;
  fullName: string; // schema와 일치
  email?: string;
  phone: string;
  telecomProvider?: string;
  address?: string;
  occupation?: string;
  hasDrivingLicense?: boolean;
  height?: number; // cm
  weight?: number; // kg
  tags?: string[];
  importance: 'high' | 'medium' | 'low';
  currentStageId: string; // schema와 일치
  referredById?: string; // schema와 일치
  notes?: string;
  customFields?: Record<string, any>; // jsonb
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // 조인된 필드들 (runtime에 추가됨)
  currentStage?: {
    id: string;
    name: string;
    color: string;
    order: number;
  };
  referredBy?: {
    id: string;
    fullName: string;
    phone?: string;
  };
  referralCount?: number; // analytics 테이블에서
  contractAmount?: number; // 계산된 필드
  lastContactDate?: string; // contact history에서
  nextMeetingDate?: string; // meetings 테이블에서
}

// 클라이언트 태그 타입
export interface ClientTag {
  id: string;
  agentId: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// 클라이언트 연락 기록 타입
export interface ClientContactHistory {
  id: string;
  clientId: string;
  agentId: string;
  contactMethod:
    | 'phone'
    | 'email'
    | 'kakao'
    | 'sms'
    | 'in_person'
    | 'video_call';
  subject?: string;
  content?: string;
  duration?: number; // 분
  outcome?: string;
  nextAction?: string;
  nextActionDate?: string;
  attachments?: any; // jsonb
  createdAt: string;
}

// 클라이언트 가족 구성원 타입
export interface ClientFamilyMember {
  id: string;
  clientId: string;
  name: string;
  relationship: string; // 배우자, 자녀, 부모 등
  birthDate?: string;
  gender?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  hasInsurance: boolean;
  insuranceDetails?: any; // jsonb
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 클라이언트 선호도 타입
export interface ClientPreferences {
  id: string;
  clientId: string;
  preferredContactMethod:
    | 'phone'
    | 'email'
    | 'kakao'
    | 'sms'
    | 'in_person'
    | 'video_call';
  preferredContactTime?: any; // jsonb: { start: "09:00", end: "18:00", days: [1,2,3,4,5] }
  communicationStyle?: string; // formal, casual, technical
  interests?: string[];
  concerns?: string[];
  budget?: any; // jsonb: { min: 100000, max: 500000, currency: "KRW" }
  riskTolerance?: string; // conservative, moderate, aggressive
  investmentGoals?: string[];
  specialNeeds?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 클라이언트 분석 타입
export interface ClientAnalytics {
  id: string;
  clientId: string;
  totalContacts: number;
  lastContactDate?: string;
  averageResponseTime?: number; // 시간 단위
  engagementScore?: number; // 0-100
  conversionProbability?: number; // 0-100
  lifetimeValue?: number;
  acquisitionCost?: number;
  referralCount: number;
  referralValue?: number;
  lastAnalyzedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 클라이언트 마일스톤 타입
export interface ClientMilestone {
  id: string;
  clientId: string;
  agentId: string;
  title: string;
  description?: string;
  category?: string; // contract, payment, renewal, claim, etc.
  value?: number;
  achievedAt: string;
  isSignificant: boolean;
  metadata?: any; // jsonb
  createdAt: string;
}

// 단계 변경 이력 타입
export interface StageHistory {
  id: string;
  clientId: string;
  agentId: string;
  fromStage?: string;
  toStage: string;
  reason?: string;
  notes?: string;
  changedAt: string;
}

// 배지 관련 타입들
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

export interface BadgeConfig {
  [key: string]: BadgeVariant;
}

// 소개 네트워크 관련 타입
export interface ReferralNetwork {
  referrals: Array<{
    id: string;
    fullName: string;
    currentStage?: string;
    contractAmount: number;
    relationship: string;
    phone: string;
    lastContactDate?: string;
  }>;
  siblingReferrals: Array<{
    id: string;
    fullName: string;
    currentStage?: string;
    contractAmount: number;
    relationship: string;
    lastContactDate?: string;
  }>;
  stats: {
    totalReferred: number;
    totalContracts: number;
    totalValue: number;
    conversionRate: number;
  };
}

// 공통 스키마의 타입들도 여기서 재정의 (일관성을 위해)
export interface Meeting {
  id: string;
  clientId: string;
  agentId: string;
  title: string;
  scheduledDate: string;
  duration: number;
  location?: string;
  type:
    | 'first_consultation'
    | 'product_explanation'
    | 'contract_review'
    | 'follow_up'
    | 'other';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  outcome?: string;
  nextAction?: string;
  checklist?: any; // jsonb
  createdAt: string;
  updatedAt: string;
}

// 보험 정보 타입 (공통 스키마)
export interface InsuranceInfo {
  id: string;
  clientId: string;
  type: 'life' | 'health' | 'auto' | 'prenatal' | 'property' | 'other';
  policyNumber?: string;
  insurer?: string;
  premium?: number;
  coverage?: number;
  startDate?: string;
  endDate?: string;
  status: string;
  documents?: any; // jsonb
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 문서 타입 (공통 스키마)
export interface Document {
  id: string;
  clientId: string;
  name: string;
  type:
    | 'policy'
    | 'id_card'
    | 'vehicle_registration'
    | 'vehicle_photo'
    | 'dashboard_photo'
    | 'license_plate_photo'
    | 'blackbox_photo'
    | 'insurance_policy_photo'
    | 'other';
  size: number;
  mimeType: string;
  url: string;
  description?: string;
  relatedInsuranceId?: string;
  createdAt: string;
  updatedAt: string;
}

// 통계 타입
export interface ClientStats {
  totalReferrals: number;
  averageDepth: number;
  topReferrers: Array<{
    name: string;
    count: number;
  }>;
}

// 필터 및 검색 관련 타입
export interface ClientFilter {
  stages?: string[];
  importance?: ('high' | 'medium' | 'low')[];
  tags?: string[];
  sources?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasInsurance?: boolean;
  hasFamilyMembers?: boolean;
  engagementScore?: {
    min: number;
    max: number;
  };
}

export interface ClientSearchResult {
  clients: Client[];
  totalCount: number;
  facets: {
    stages: { name: string; count: number }[];
    importance: { level: string; count: number }[];
    tags: { name: string; count: number }[];
    sources: { source: string; count: number }[];
  };
}

// 클라이언트 종합 정보 타입
export interface ClientOverview {
  client: Client;
  analytics?: ClientAnalytics;
  preferences?: ClientPreferences;
  tags: ClientTag[];
  familyMembers: ClientFamilyMember[];
  recentContacts: ClientContactHistory[];
  milestones: ClientMilestone[];
  meetings: Meeting[];
  insurances: InsuranceInfo[];
  documents: Document[];
}
