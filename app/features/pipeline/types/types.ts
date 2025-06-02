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
  // 개인정보 동의 관련
  consentDate?: string;
  profileImageUrl?: string;
  createdAt?: string; // 체류 기간 계산용
}

export interface LoaderData {
  stages: PipelineStage[];
  clients: Client[];
}
