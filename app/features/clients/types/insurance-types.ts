/**
 * 🏥 보험 관련 타입 정의
 * 
 * 보험 계약 관리에 사용되는 모든 타입을 정의합니다.
 */

// 📋 보험계약 타입 정의
export interface InsuranceContract {
  id: string;
  productName: string;
  insuranceCompany: string;
  insuranceType: string;
  insuranceCode?: string; // 🆕 보종코드
  contractNumber?: string;
  policyNumber?: string;
  contractDate: string;
  effectiveDate: string;
  expirationDate?: string;
  paymentDueDate?: string; // 🆕 납기일
  contractorName: string;
  contractorSsn?: string; // 🆕 계약자 주민번호
  contractorPhone?: string; // 🆕 계약자 연락처
  insuredName: string;
  insuredSsn?: string; // 🆕 피보험자 주민번호
  insuredPhone?: string; // 🆕 피보험자 연락처
  beneficiaryName?: string;
  premiumAmount?: string; // 🆕 납입보험료 (통합)
  monthlyPremium?: string; // 🔧 decimal 타입은 string으로 반환됨
  annualPremium?: string; // 🔧 decimal 타입은 string으로 반환됨
  coverageAmount?: string; // 🔧 decimal 타입은 string으로 반환됨
  agentCommission?: string; // 🔧 decimal 타입은 string으로 반환됨
  status: 'draft' | 'active' | 'cancelled' | 'expired' | 'suspended';
  paymentMethod?: string;
  paymentCycle?: string; // 🆕 납입주기
  paymentPeriod?: number;
  specialClauses?: string;
  notes?: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileDisplayName: string;
    documentType: string;
    description?: string; // 🔧 설명 필드 추가
  }>;
}

// 📝 보험계약 탭 컴포넌트 Props
export interface InsuranceContractsTabProps {
  clientId?: string;
  clientName?: string;
  agentId?: string;
  initialContracts?: InsuranceContract[];
  shouldOpenModal?: boolean; // 🏢 파이프라인에서 계약 전환 시 모달 자동 열기
}

// 📝 보험계약 폼 데이터 타입
export interface ContractFormData {
  productName: string;
  insuranceCompany: string;
  insuranceType: string;
  insuranceCode: string; // 🆕 보종코드
  contractNumber: string;
  policyNumber: string;
  contractDate: string;
  effectiveDate: string;
  expirationDate: string;
  paymentDueDate: string; // 🆕 납기일
  contractorName: string;
  contractorSsn: string; // 🆕 계약자 주민번호
  contractorPhone: string; // 🆕 계약자 연락처
  insuredName: string;
  insuredSsn: string; // 🆕 피보험자 주민번호
  insuredPhone: string; // 🆕 피보험자 연락처
  beneficiaryName: string;
  premiumAmount: string; // 🆕 납입보험료 (통합)
  monthlyPremium: string;
  annualPremium: string;
  coverageAmount: string;
  agentCommission: string;
  paymentCycle: string; // 🆕 납입주기 (납입방법)
  paymentPeriod: string;
  specialClauses: string;
  notes: string;
}

// 📁 첨부파일 타입 정의
export interface AttachmentData {
  id: string;
  file?: File; // 새 첨부파일의 경우에만 File 객체 존재
  fileName: string;
  fileDisplayName: string;
  documentType: string;
  description?: string;
  isExisting?: boolean; // 기존 첨부파일 여부
  fileUrl?: string; // 기존 첨부파일의 URL
}

// 📄 문서 타입 상수 정의
export const DOCUMENT_TYPES = [
  'contract',
  'application',
  'identification',
  'medical_report',
  'financial_statement',
  'other_document',
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];

// 🎨 보험 유형별 색상 설정
export const INSURANCE_TYPE_COLORS: Record<string, string> = {
  life: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  car: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  fire: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  travel: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  annuity: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  pension: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  accident: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

// 📊 보험 상태별 색상 설정
export const STATUS_COLORS: Record<InsuranceContract['status'], string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

// 🆕 모달 Props 타입 정의
export interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ContractFormData, attachments: AttachmentData[]) => Promise<void>;
  initialData?: InsuranceContract | null;
  clientName?: string;
  isSubmitting?: boolean;
}