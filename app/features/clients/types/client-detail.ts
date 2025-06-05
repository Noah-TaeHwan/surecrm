import type { Client } from '~/lib/schema';
import type {
  AppClientContactHistory,
  AppClientAnalytics,
} from '../lib/schema';

// 🎯 확장된 고객 프로필 타입 (상세 페이지용)
export interface ClientDetailProfile extends Client {
  // 계산 필드들
  referralCount: number;
  insuranceTypes: string[];
  totalPremium: number;
  currentStage: {
    id: string;
    name: string;
    color: string;
  };
  engagementScore: number;
  conversionProbability: number;
  lifetimeValue: number;
  lastContactDate?: string;
  nextActionDate?: string;
  upcomingMeeting?: {
    date: string;
    type: string;
  };
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
  // 상세 데이터
  recentContacts: AppClientContactHistory[];
  analytics: AppClientAnalytics | null;
  familyMembers: any[];
  milestones: any[];
}

// 로더 데이터 타입
export interface ClientDetailLoaderData {
  client: Client | null;
  currentUserId: string | null;
  currentUser: {
    id: string;
    email: string;
    name: string;
  };
  isEmpty: boolean;
  error?: string;
  clientOverview?: any;
  availableStages?: any[];
}

// 병력사항 타입
export interface MedicalHistory {
  // 3개월 이내
  hasRecentDiagnosis: boolean;
  hasRecentSuspicion: boolean;
  hasRecentMedication: boolean;
  hasRecentTreatment: boolean;
  hasRecentHospitalization: boolean;
  hasRecentSurgery: boolean;
  recentMedicalDetails: string;
  // 1년 이내 재검사
  hasAdditionalExam: boolean;
  additionalExamDetails: string;
  // 5년 이내
  hasMajorHospitalization: boolean;
  hasMajorSurgery: boolean;
  hasLongTermTreatment: boolean;
  hasLongTermMedication: boolean;
  majorMedicalDetails: string;
}

// 검진 목적 타입
export interface CheckupPurposes {
  // 걱정사항
  isInsurancePremiumConcern: boolean;
  isCoverageConcern: boolean;
  isMedicalHistoryConcern: boolean;
  // 필요사항
  needsDeathBenefit: boolean;
  needsImplantPlan: boolean;
  needsCaregiverInsurance: boolean;
  needsDementiaInsurance: boolean;
  // 저축 현황
  currentSavingsLocation: string;
  additionalConcerns: string;
}

// 관심 분야 타입
export interface InterestCategories {
  interestedInAutoInsurance: boolean;
  interestedInDementia: boolean;
  interestedInDental: boolean;
  interestedInDriverInsurance: boolean;
  interestedInHealthCheckup: boolean;
  interestedInMedicalExpenses: boolean;
  interestedInFireInsurance: boolean;
  interestedInCaregiver: boolean;
  interestedInCancer: boolean;
  interestedInSavings: boolean;
  interestedInLiability: boolean;
  interestedInLegalAdvice: boolean;
  interestedInTax: boolean;
  interestedInInvestment: boolean;
  interestedInPetInsurance: boolean;
  interestedInAccidentInsurance: boolean;
  interestedInTrafficAccident: boolean;
  interestNotes: string;
}

// 상담 동반자 타입
export interface ConsultationCompanion {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

// 상담 내용 타입
export interface ConsultationNote {
  id?: string;
  consultationDate: string;
  title: string;
  content: string;
  contractInfo?: string;
  followUpDate?: string;
  followUpNotes?: string;
}

// 편집 폼 데이터 타입
export interface EditFormData {
  fullName: string;
  phone: string;
  email: string;
  telecomProvider: string;
  address: string;
  occupation: string;
  height: string;
  weight: string;
  hasDrivingLicense: boolean;
  importance: 'high' | 'medium' | 'low';
  notes: string;
  ssn: string;
  ssnFront: string;
  ssnBack: string;
  birthDate: string;
  gender: 'male' | 'female' | '';
  ssnError?: string;
}

// 태그 폼 타입
export interface TagForm {
  id: string;
  name: string;
  color: string;
  description: string;
}

// 영업 기회 생성 데이터 타입
export interface OpportunityData {
  insuranceType: string;
  notes: string;
}

// 성공 모달 데이터 타입
export interface OpportunitySuccessData {
  clientName: string;
  insuranceType: string;
  stageName: string;
}

// 에러 모달 콘텐츠 타입
export interface ErrorModalContent {
  title: string;
  message: string;
}
