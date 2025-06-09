import { z } from 'zod';

// 🎯 상수 정의 (하드코딩 제거)
export const IMPORTANCE_OPTIONS = [
  { value: 'high', label: '키맨' },
  { value: 'medium', label: '일반' },
  { value: 'low', label: '관심' },
] as const;

export const TELECOM_PROVIDER_OPTIONS = [
  { value: 'none', label: '선택 안함' },
  { value: 'SKT', label: 'SKT' },
  { value: 'KT', label: 'KT' },
  { value: 'LG U+', label: 'LG U+' },
  { value: '알뜰폰 SKT', label: '알뜰폰 SKT' },
  { value: '알뜰폰 KT', label: '알뜰폰 KT' },
  { value: '알뜰폰 LG U+', label: '알뜰폰 LG U+' },
] as const;

export const RELATIONSHIP_OPTIONS = [
  { value: '배우자', label: '배우자', icon: '💑' },
  { value: '자녀', label: '자녀', icon: '👶' },
  { value: '부모', label: '부모', icon: '👨‍👩‍👧‍👦' },
  { value: '형제/자매', label: '형제/자매', icon: '👫' },
  { value: '친구', label: '친구', icon: '👭' },
  { value: '동료', label: '동료', icon: '🤝' },
  { value: '기타', label: '기타', icon: '👤' },
] as const;
import type {
  MedicalHistory,
  CheckupPurposes,
  InterestCategories,
  EditFormData,
} from '../types/client-detail';

// 🎯 Zod 유효성 검증 스키마
export const ClientValidationSchema = z.object({
  fullName: z
    .string()
    .min(1, '고객명을 입력해주세요')
    .max(50, '고객명은 50자 이내로 입력해주세요'),
  phone: z
    .string()
    .min(1, '전화번호를 입력해주세요')
    .regex(
      /^(01[016789])-?(\d{3,4})-?(\d{4})$/,
      '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'
    ),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      '올바른 이메일 형식이 아닙니다'
    ),
  address: z.string().max(200, '주소는 200자 이내로 입력해주세요').optional(),
  occupation: z.string().max(50, '직업은 50자 이내로 입력해주세요').optional(),
  height: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const height = parseInt(val);
      return !isNaN(height) && height >= 100 && height <= 250;
    }, '키는 100cm~250cm 사이로 입력해주세요'),
  weight: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const weight = parseInt(val);
      return !isNaN(weight) && weight >= 30 && weight <= 200;
    }, '몸무게는 30kg~200kg 사이로 입력해주세요'),
  telecomProvider: z.string().optional(),
  notes: z.string().max(1000, '메모는 1000자 이내로 입력해주세요').optional(),
  ssn: z.string().optional(),
  importance: z.enum(['high', 'medium', 'low']),
  hasDrivingLicense: z.boolean(),
});

// 나이 계산 함수
export function calculateAge(
  birthDate: Date,
  type: 'standard' | 'korean' | 'insurance'
): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const birthYear = birthDate.getFullYear();

  switch (type) {
    case 'korean':
      // 한국 나이: 현재 년도 - 태어난 년도 + 1
      return currentYear - birthYear + 1;

    case 'insurance':
      // 보험 나이: 만 나이에서 6개월 이후면 +1
      const standardAge = currentYear - birthYear;
      const thisYearBirthday = new Date(
        currentYear,
        birthDate.getMonth(),
        birthDate.getDate()
      );
      const sixMonthsAfterBirthday = new Date(
        thisYearBirthday.getTime() + 6 * 30 * 24 * 60 * 60 * 1000
      );

      if (today >= sixMonthsAfterBirthday) {
        return standardAge + 1;
      }
      return standardAge;

    case 'standard':
    default:
      // 만 나이: 생일이 지났는지 확인
      const thisYearBirthday2 = new Date(
        currentYear,
        birthDate.getMonth(),
        birthDate.getDate()
      );
      return today >= thisYearBirthday2
        ? currentYear - birthYear
        : currentYear - birthYear - 1;
  }
}

// BMI 계산 함수 (성별 고려 가능)
export function calculateBMI(
  height: string,
  weight: string,
  gender?: string
): number | null {
  const h = parseFloat(height);
  const w = parseFloat(weight);

  if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
    return null;
  }

  // BMI = 체중(kg) / 키(m)²
  const heightInMeters = h / 100;
  return Math.round((w / (heightInMeters * heightInMeters)) * 10) / 10;
}

// BMI 상태 가져오기 함수 (성별별 기준 적용)
export function getBMIStatus(
  bmi: number,
  gender?: string
): { status: string; color: string; detail: string } {
  // 🎯 성별별 BMI 기준 적용 (한국 보건복지부 기준)
  const isFemale = gender === 'female';

  if (bmi < 18.5) {
    return {
      status: '저체중',
      color: 'text-blue-600',
      detail: isFemale ? '여성 기준 저체중' : '남성 기준 저체중',
    };
  } else if (bmi < (isFemale ? 22.9 : 24.9)) {
    return {
      status: '정상체중',
      color: 'text-green-600',
      detail: isFemale ? '여성 기준 정상' : '남성 기준 정상',
    };
  } else if (bmi < (isFemale ? 24.9 : 29.9)) {
    return {
      status: '과체중',
      color: 'text-yellow-600',
      detail: isFemale ? '여성 기준 과체중' : '남성 기준 과체중',
    };
  } else if (bmi < 30) {
    return {
      status: '비만',
      color: 'text-orange-600',
      detail: '성별 무관 비만',
    };
  } else {
    return {
      status: '고도비만',
      color: 'text-red-600',
      detail: '성별 무관 고도비만',
    };
  }
}

// 🆕 성별별 이상 체중 범위 계산 함수
export function getIdealWeightRange(
  height: string,
  gender?: string
): { min: number; max: number } | null {
  const h = parseFloat(height);
  if (isNaN(h) || h <= 0) return null;

  const heightInMeters = h / 100;
  const isFemale = gender === 'female';

  // 정상 BMI 범위로 이상 체중 계산
  const minBMI = 18.5;
  const maxBMI = isFemale ? 22.9 : 24.9;

  const minWeight = Math.round(minBMI * heightInMeters * heightInMeters);
  const maxWeight = Math.round(maxBMI * heightInMeters * heightInMeters);

  return { min: minWeight, max: maxWeight };
}

// 중요도에 따른 카드 스타일 가져오기 (원본과 동일)
export function getClientCardStyle(importance: string) {
  switch (importance) {
    case 'high':
      return {
        bgGradient:
          'bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background',
        borderClass: 'client-card-keyman', // 키맨 전용 애니메이션 클래스
      };
    case 'medium':
      return {
        bgGradient:
          'bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background',
        borderClass: 'client-card-normal', // 일반 고객 은은한 효과
      };
    case 'low':
      return {
        bgGradient:
          'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
        borderClass: 'client-card-low', // 은은한 회색 효과
      };
    default:
      return {
        bgGradient:
          'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
        borderClass: '',
      };
  }
}

// 중요도 배지 가져오기 (원본과 동일한 스타일)
export function getImportanceBadge(importance: string) {
  // 🎨 중요도별 통일된 색상 시스템 (CSS 변수 사용)
  const importanceStyles = {
    high: 'border bg-[var(--importance-high-badge-bg)] text-[var(--importance-high-badge-text)] border-[var(--importance-high-border)]',
    medium:
      'border bg-[var(--importance-medium-badge-bg)] text-[var(--importance-medium-badge-text)] border-[var(--importance-medium-border)]',
    low: 'border bg-[var(--importance-low-badge-bg)] text-[var(--importance-low-badge-text)] border-[var(--importance-low-border)]',
  };

  const importanceText = {
    high: '키맨',
    medium: '일반',
    low: '관심',
  };

  const style =
    importanceStyles[importance as keyof typeof importanceStyles] ||
    importanceStyles.medium;
  const text =
    importanceText[importance as keyof typeof importanceText] || importance;

  return { style, text };
}

// 보험 유형 이름 가져오기 (원본과 동일)
export function getInsuranceTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    auto: '자동차보험',
    life: '생명보험',
    health: '건강보험',
    home: '주택보험',
    business: '사업자보험',
  };
  return typeMap[type] || type;
}

// 폼 검증 함수 (원본과 동일)
export function validateForm(editFormData: EditFormData): {
  isValid: boolean;
  errors: string[];
} {
  try {
    const formData = {
      fullName: editFormData.fullName,
      phone: editFormData.phone,
      email: editFormData.email || undefined,
      address: editFormData.address || undefined,
      occupation: editFormData.occupation || undefined,
      height: editFormData.height || undefined,
      weight: editFormData.weight || undefined,
      telecomProvider:
        editFormData.telecomProvider === 'none'
          ? undefined
          : editFormData.telecomProvider,
      notes: editFormData.notes || undefined,
      ssn: editFormData.ssn || undefined,
      importance: editFormData.importance,
      hasDrivingLicense: editFormData.hasDrivingLicense,
    };

    ClientValidationSchema.parse(formData);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ),
      };
    }
    return {
      isValid: false,
      errors: ['알 수 없는 유효성 검사 오류가 발생했습니다.'],
    };
  }
}

// 폼 검증 함수 (기존)
export function validateClientForm(formData: EditFormData): string[] {
  const errors: string[] = [];

  try {
    ClientValidationSchema.parse({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      occupation: formData.occupation || undefined,
      height: formData.height || undefined,
      weight: formData.weight || undefined,
      telecomProvider: formData.telecomProvider || undefined,
      notes: formData.notes || undefined,
      ssn: formData.ssn || undefined,
      importance: formData.importance,
      hasDrivingLicense: formData.hasDrivingLicense,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map((err) => err.message);
    }
  }

  return errors;
}

// 초기 의료 이력 상태
export function getInitialMedicalHistory(): MedicalHistory {
  return {
    hasRecentDiagnosis: false,
    hasRecentSuspicion: false,
    hasRecentMedication: false,
    hasRecentTreatment: false,
    hasRecentHospitalization: false,
    hasRecentSurgery: false,
    recentMedicalDetails: '',
    hasAdditionalExam: false,
    additionalExamDetails: '',
    hasMajorHospitalization: false,
    hasMajorSurgery: false,
    hasLongTermTreatment: false,
    hasLongTermMedication: false,
    majorMedicalDetails: '',
  };
}

// 초기 검진 목적 상태
export function getInitialCheckupPurposes(): CheckupPurposes {
  return {
    isInsurancePremiumConcern: false,
    isCoverageConcern: false,
    isMedicalHistoryConcern: false,
    needsDeathBenefit: false,
    needsImplantPlan: false,
    needsCaregiverInsurance: false,
    needsDementiaInsurance: false,
    currentSavingsLocation: '',
    additionalConcerns: '',
  };
}

// 초기 관심 카테고리 상태
export function getInitialInterestCategories(): InterestCategories {
  return {
    interestedInAutoInsurance: false,
    interestedInDementia: false,
    interestedInDental: false,
    interestedInDriverInsurance: false,
    interestedInHealthCheckup: false,
    interestedInMedicalExpenses: false,
    interestedInFireInsurance: false,
    interestedInCaregiver: false,
    interestedInCancer: false,
    interestedInSavings: false,
    interestedInLiability: false,
    interestedInLegalAdvice: false,
    interestedInTax: false,
    interestedInInvestment: false,
    interestedInPetInsurance: false,
    interestedInAccidentInsurance: false,
    interestedInTrafficAccident: false,
    interestNotes: '',
  };
}

// 클라이언트 데이터로부터 편집 폼 데이터 생성
export function createEditFormDataFromClient(client: any): EditFormData {
  return {
    fullName: client?.fullName || '',
    phone: client?.phone || '',
    email: client?.email || '',
    telecomProvider: client?.telecomProvider || 'none',
    address: client?.address || '',
    occupation: client?.occupation || '',
    height: client?.height?.toString() || '',
    weight: client?.weight?.toString() || '',
    hasDrivingLicense: client?.hasDrivingLicense || false,
    importance: client?.importance || 'medium',
    notes: client?.notes || '',
    ssn: '',
    ssnFront: '',
    ssnBack: '',
    birthDate: client?.birthDate || '',
    gender: client?.gender || '',
    ssnError: undefined,
  };
}
