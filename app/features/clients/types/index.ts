// 📋 Clients 기능 전용 타입 정의
// Prefix 네이밍 컨벤션: app_client_ 사용 (완전 통일)

// 새로운 스키마에서 import
import type {
  AppClientTag,
  AppClientContactHistory,
  AppClientFamilyMember,
  AppClientPreferences,
  AppClientAnalytics,
  AppClientMilestone,
  AppClientStageHistory,
  AppClientDataAccessLog,
  ClientStatus,
  ClientContactMethod,
  ClientSource,
  ClientPrivacyLevel,
  ClientDataAccessLogType,
} from '../lib/schema';

// 클라이언트 기본 타입 (공통 schema의 Client 확장)
import type { Client } from '~/lib/schema';

// 🔧 통합 태그 타입 (문자열 또는 객체)
export type UnifiedTag = string | AppClientTag;

// 🔧 클라이언트 UI 표시용 타입 (완전 통합)
export interface ClientDisplay extends Omit<Client, 'tags'> {
  // 기본 필드들은 Client에서 상속

  // 조인된 필드들 (런타임에 추가됨)
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

  // 계산된 필드들
  referralCount?: number;
  referralDepth?: number;
  contractAmount?: number;
  lastContactDate?: string;
  nextMeetingDate?: string;

  // 🏷️ 통합 태그 시스템 (문자열과 객체 모두 지원)
  tags?: UnifiedTag[];

  // 🔒 보안 관련 필드
  accessLevel?: ClientPrivacyLevel;
  hasConfidentialData?: boolean;
  privacyLevel?: ClientPrivacyLevel;
}

// 🔧 ExtendedClient 타입을 ClientDisplay로 통합
export type ExtendedClient = ClientDisplay;

// 🔒 고객 개요 (보안 강화된 버전)
export interface ClientOverview {
  client: Client;
  tags: AppClientTag[];
  preferences?: AppClientPreferences;
  analytics?: AppClientAnalytics;
  familyMembers: AppClientFamilyMember[];
  recentContacts: AppClientContactHistory[];
  milestones: AppClientMilestone[];
  stageHistory: AppClientStageHistory[];
  // 🔒 보안 정보
  accessLevel: ClientPrivacyLevel;
  dataConsents: {
    marketing: boolean;
    dataProcessing: boolean;
    thirdPartyShare: boolean;
  };
  lastAccessLog?: AppClientDataAccessLog;
}

// 🔍 고객 검색 필터 (보안 강화)
export interface ClientSearchFilters {
  query?: string;
  stageIds?: string[];
  tagIds?: string[];
  importance?: string[];
  sources?: ClientSource[];
  privacyLevels?: ClientPrivacyLevel[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasRecentContact?: boolean;
  hasUpcomingMeeting?: boolean;
  // 🔒 보안 필터
  accessLevelRequired?: ClientPrivacyLevel;
  hasConfidentialData?: boolean;
}

// 🔒 고객 보안 설정
export interface ClientSecuritySettings {
  clientId: string;
  privacyLevel: ClientPrivacyLevel;
  dataRetentionPeriod: number; // 일 단위
  accessRestrictions: string[]; // 제한된 사용자 목록
  auditLogEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  encryptionRequired: boolean;
  consentExpiry?: Date;
  gdprCompliant: boolean;
}

// 📞 연락 요약 정보
export interface ContactSummary {
  totalContacts: number;
  lastContact?: AppClientContactHistory;
  upcomingActions: {
    action: string;
    date: Date;
    priority: string;
  }[];
  responseRate: number;
  averageResponseTime: number;
  // 🔒 보안 레벨별 연락 현황
  publicContacts: number;
  restrictedContacts: number;
  confidentialContacts: number;
}

// 🌐 소개 네트워크 (기존 유지)
export interface ReferralNetwork {
  referrals: Array<{
    id: string;
    fullName: string;
    currentStage?: string;
    contractAmount: number;
    relationship: string;
    phone: string;
    lastContactDate?: string;
    // 🔒 보안 레벨 추가
    accessLevel: ClientPrivacyLevel;
  }>;
  siblingReferrals: Array<{
    id: string;
    fullName: string;
    currentStage?: string;
    contractAmount: number;
    relationship: string;
    lastContactDate?: string;
    accessLevel: ClientPrivacyLevel;
  }>;
  stats: {
    totalReferred: number;
    totalContracts: number;
    totalValue: number;
    conversionRate: number;
    // 🔒 보안 통계
    confidentialReferrals: number;
    restrictedReferrals: number;
  };
}

// 📊 고객 검색 결과 (페이징 포함)
export interface ClientSearchResult {
  clients: ExtendedClient[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  facets: {
    stages: { name: string; count: number }[];
    importance: { level: string; count: number }[];
    tags: { name: string; count: number }[];
    sources: { source: string; count: number }[];
    // 🔒 보안 레벨 분포
    privacyLevels: { level: ClientPrivacyLevel; count: number }[];
  };
}

// 📈 고객 통계 (확장)
export interface ClientStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  importanceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  // 🔒 보안 통계 추가
  privacyDistribution: {
    public: number;
    restricted: number;
    private: number;
    confidential: number;
  };
  dataComplianceStatus: {
    gdprCompliant: number;
    consentExpiring: number;
    backupRequired: number;
  };
}

// 🎯 클라이언트 마일스톤 (확장)
export interface ClientMilestoneWithDetails extends AppClientMilestone {
  agent: {
    id: string;
    fullName: string;
  };
  relatedDocuments?: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
}

// 📋 클라이언트 활동 로그
export interface ClientActivityLog {
  id: string;
  clientId: string;
  activityType:
    | 'contact'
    | 'meeting'
    | 'document'
    | 'stage_change'
    | 'tag_added'
    | 'milestone';
  title: string;
  description?: string;
  performedBy: {
    id: string;
    fullName: string;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
  // 🔒 보안 레벨
  privacyLevel: ClientPrivacyLevel;
  isConfidential: boolean;
}

// 📝 클라이언트 양식 관련 타입들
export interface ClientFormData {
  // 기본 정보
  fullName: string;
  phone: string;
  email?: string;
  telecomProvider?: string;

  // 회사 정보
  company?: string;
  position?: string;
  address?: string;
  occupation?: string;

  // 개인 정보
  birthDate?: string;
  gender?: 'male' | 'female';
  ssn?: string;
  height?: number;
  weight?: number;
  hasDrivingLicense?: boolean;

  // 영업 정보
  currentStageId: string;
  importance: 'high' | 'medium' | 'low';
  referredById?: string;
  tags?: string[];
  notes?: string;
  contractAmount?: number;

  // 🔒 보안 및 동의 정보
  privacyLevel: ClientPrivacyLevel;
  dataProcessingConsent: boolean;
  marketingConsent?: boolean;
  thirdPartyConsent?: boolean;
  personalInfoConsent: boolean;

  // 보험 관련
  insuranceType?: string;
  familySize?: number;
  childrenAges?: number[];
  vehicleType?: string;
  drivingExperience?: number;
}

export interface ClientEditFormData extends Partial<ClientFormData> {
  id: string;
}

// 🏷️ 태그 관련 타입들 (새 스키마 기반)
export interface TagWithUsage extends AppClientTag {
  usageCount: number;
  lastUsed?: Date;
  // 🔒 보안 설정
  accessLevel: ClientPrivacyLevel;
  restrictedTo?: string[]; // 특정 사용자에게만 표시
}

export interface TagAssignment {
  tagId: string;
  clientId: string;
  assignedBy: string;
  assignedAt: Date;
  // 태그 정보 (조인됨)
  tag: AppClientTag;
}

// 📱 UI 관련 타입들
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

export interface BadgeConfig {
  [key: string]: BadgeVariant;
}

export interface ClientCardProps {
  client: ExtendedClient;
  showActions?: boolean;
  compact?: boolean;
  onClick?: (client: ExtendedClient) => void;
  // 🔒 보안 관련 props
  hideConfidentialData?: boolean;
  requiredAccessLevel?: ClientPrivacyLevel;
}

export interface ClientListProps {
  clients: ExtendedClient[];
  loading?: boolean;
  onClientSelect?: (client: ExtendedClient) => void;
  onClientEdit?: (client: ExtendedClient) => void;
  onClientDelete?: (client: ExtendedClient) => void;
  // 🔒 보안 관련 props
  userAccessLevel: ClientPrivacyLevel;
  showConfidentialData: boolean;
}

// 📤 데이터 내보내기 관련
export interface ClientExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  fields: string[];
  includePersonalData: boolean;
  includeAnalytics: boolean;
  includeFamilyData: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  // 🔒 보안 설정
  privacyLevelsToInclude: ClientPrivacyLevel[];
  anonymizeData: boolean;
  watermark?: string;
}

export interface ClientExportResult {
  success: boolean;
  downloadUrl?: string;
  recordCount: number;
  excludedRecords: number;
  errorMessage?: string;
  // 🔒 감사 정보
  exportedBy: string;
  exportedAt: Date;
  dataAccessLogged: boolean;
}

// 🔄 데이터 마이그레이션 관련
export interface ClientMigrationStatus {
  clientId: string;
  migratedTables: string[];
  pendingTables: string[];
  hasErrors: boolean;
  errorDetails?: string[];
  migrationDate: Date;
  backupCreated: boolean;
}

// 이전 버전과의 호환성을 위한 타입 재정의 (Deprecated)
/** @deprecated Use AppClientTag instead */
export type ClientTag = AppClientTag;

/** @deprecated Use AppClientContactHistory instead */
export type ClientContactHistory = AppClientContactHistory;

/** @deprecated Use AppClientFamilyMember instead */
export type ClientFamilyMember = AppClientFamilyMember;

/** @deprecated Use AppClientPreferences instead */
export type ClientPreferences = AppClientPreferences;

/** @deprecated Use AppClientAnalytics instead */
export type ClientAnalytics = AppClientAnalytics;

/** @deprecated Use AppClientMilestone instead */
export type ClientMilestone = AppClientMilestone;

/** @deprecated Use ClientSearchFilters instead */
export interface ClientFilter {
  stages?: string[];
  importance?: string[];
  tags?: string[];
  sources?: ClientSource[];
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

// 새로운 스키마 타입들을 re-export (편의성)
export type {
  AppClientTag,
  AppClientContactHistory,
  AppClientFamilyMember,
  AppClientPreferences,
  AppClientAnalytics,
  AppClientMilestone,
  AppClientStageHistory,
  AppClientDataAccessLog,
  ClientStatus,
  ClientContactMethod,
  ClientSource,
  ClientPrivacyLevel,
  ClientDataAccessLogType,
} from '../lib/schema';

// 🔧 타입 헬퍼 함수들
export const typeHelpers = {
  // 태그 이름 추출 (안전한 방식)
  getTagName: (tag: UnifiedTag): string => {
    return typeof tag === 'string' ? tag : tag.name;
  },

  // 태그 ID 추출 (객체인 경우만)
  getTagId: (tag: UnifiedTag): string | undefined => {
    return typeof tag === 'string' ? undefined : tag.id;
  },

  // 클라이언트 표시 이름 추출
  getClientDisplayName: (client: ClientDisplay): string => {
    return client.fullName || client.name || 'Unknown';
  },

  // 보안 레벨 확인
  hasAccess: (
    client: ClientDisplay,
    requiredLevel: ClientPrivacyLevel
  ): boolean => {
    const levels: ClientPrivacyLevel[] = [
      'public',
      'restricted',
      'private',
      'confidential',
    ];
    const clientLevel = client.accessLevel || client.privacyLevel || 'public';
    return levels.indexOf(clientLevel) <= levels.indexOf(requiredLevel);
  },

  // 데이터 마스킹
  maskData: (
    data: string,
    level: ClientPrivacyLevel,
    showConfidential: boolean = false
  ): string => {
    if (showConfidential || level === 'public') return data;

    if (level === 'confidential') return '***';
    if (level === 'restricted' && data.length > 4) {
      return data.slice(0, 2) + '***' + data.slice(-2);
    }

    return data;
  },
};

// 📋 하위 호환성을 위한 기존 타입들 (deprecated)
/** @deprecated ExtendedClient 대신 ClientDisplay 사용 권장 */
export interface LegacyExtendedClient extends ClientDisplay {}

/** @deprecated typeHelpers.getTagName() 사용 권장 */
export const getTagDisplayName = typeHelpers.getTagName;

// 🔒 **보안 감사 로그** (통합)
export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceType: 'client' | 'insurance' | 'meeting' | 'document';
  resourceId: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  privacyLevel: ClientPrivacyLevel;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// 🔒 **미팅 보안 데이터**
export interface SecureMeetingData {
  id: string;
  clientId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  location: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  privacyLevel: ClientPrivacyLevel;
  containsSensitiveInfo: boolean;
  dataProcessingConsent: boolean;
  recordingConsent?: boolean;
  attendeeConfidentiality?: boolean;
  createdAt: string;
  updatedAt?: string;
  agentId?: string;
}

// 🔒 **보험 보안 데이터**
export interface SecureInsuranceData {
  id: string;
  clientId: string;
  type: 'life' | 'health' | 'auto' | 'prenatal' | 'property' | 'other';
  policyNumber?: string;
  insurer?: string;
  premium?: number;
  coverage?: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'pending' | 'cancelled';
  documents: string[];
  notes?: string;
  privacyLevel: ClientPrivacyLevel;
  isEncrypted: boolean;
  accessRestriction: 'agent' | 'manager' | 'admin';
  healthInfoConsent?: boolean;
  financialInfoConsent?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 🔒 **문서 보안 데이터**
export interface SecureDocumentData {
  id: string;
  clientId: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  privacyLevel: ClientPrivacyLevel;
  isEncrypted: boolean;
  accessLogRequired: boolean;
  expiresAt?: string;
  downloadCount?: number;
  lastAccessedAt?: string;
}
