// 클라이언트 기본 타입
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  telecomProvider?: string;
  company?: string;
  position?: string;
  address?: string;
  occupation?: string;
  height?: number;
  weight?: number;
  hasDrivingLicense?: boolean;
  status: 'active' | 'inactive';
  stage: string;
  importance: 'high' | 'medium' | 'low';
  referredBy?: {
    id: string;
    name: string;
    phone?: string;
    relationship: string;
  };
  tags: string[];
  notes?: string;
  contractAmount: number;
  lastContactDate?: string;
  nextMeeting?: {
    date: string;
    time: string;
    type: string;
    location: string;
  };
  nextMeetingDate?: string;
  referralCount: number;
  referralDepth: number;
  insuranceTypes?: string[];
  profileImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

// 배지 변형 타입
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

// 배지 설정 타입
export interface BadgeConfig {
  [key: string]: BadgeVariant;
}

// 소개 네트워크 관련 타입
export interface ReferralNetwork {
  referrals: Array<{
    id: string;
    name: string;
    stage: string;
    contractAmount: number;
    relationship: string;
    phone: string;
    lastContact: string;
  }>;
  siblingReferrals: Array<{
    id: string;
    name: string;
    stage: string;
    contractAmount: number;
    relationship: string;
    lastContact: string;
  }>;
  stats: {
    totalReferred: number;
    totalContracts: number;
    totalValue: number;
    conversionRate: number;
  };
}

// 미팅 관련 타입
export interface Meeting {
  id: string;
  date: string;
  time: string;
  type: string;
  location: string;
  duration: number;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  attendees: string[];
  outcome?: string;
  nextAction?: string;
  checklist: Array<{
    item: string;
    completed: boolean;
  }>;
}

// 보험 정보 타입
export interface InsuranceInfo {
  id: string;
  type: string;
  status: 'active' | 'reviewing' | 'inactive';
  details: Record<string, any>;
  documents: string[];
  premium?: number;
  startDate?: string;
  endDate?: string;
  estimatedStartDate?: string;
  createdAt: string;
}

// 문서 타입
export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  description?: string;
  relatedInsurance?: string | null;
  url: string;
}

// 진행 내역 타입
export interface StageHistory {
  stage: string;
  date: string;
  note: string;
  agent: string;
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
