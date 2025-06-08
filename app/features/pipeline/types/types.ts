export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface InsuranceInfo {
  id: string;
  type: 'life' | 'health' | 'auto' | 'prenatal' | 'property' | 'other';
  details: {
    // 태아보험 관련
    dueDate?: string;
    conceptionMethod?: 'natural' | 'ivf';
    abortionPreventionMeds?: boolean;
    abnormalFindings?: boolean;
    disabilityTestFindings?: boolean;
    // 자동차보험 관련
    vehicleNumber?: string;
    ownerName?: string;
    vehicleType?: string;
    manufacturer?: string;
    // 기타 보험별 상세 정보
    [key: string]: any;
  };
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  telecomProvider?: string;
  height?: number;
  weight?: number;
  hasDrivingLicense?: boolean;
  referredBy?: {
    id: string;
    name: string;
  } | null;
  importance: 'high' | 'medium' | 'low';
  lastContactDate?: string;
  nextMeeting?: {
    date: string;
    time: string;
    type: string;
  };
  note?: string;
  tags?: string[];
  stageId: string;
  insuranceInfo?: InsuranceInfo[];
  interestCategories?: Array<{ label: string; icon: string }>;
  // 개인정보 동의 관련
  consentDate?: string;
  profileImageUrl?: string;
  createdAt?: string; // 체류 기간 계산용
  // 🆕 상품 정보 필드들
  products?: Array<{
    id: string;
    productName: string;
    insuranceCompany: string;
    insuranceType: string;
    monthlyPremium?: string;
    expectedCommission?: string;
    notes?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  totalMonthlyPremium?: number;
  totalExpectedCommission?: number;
}

export interface LoaderData {
  stages: PipelineStage[];
  clients: Client[];
}
