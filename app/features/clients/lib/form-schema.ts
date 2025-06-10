import * as z from 'zod';

// 📋 Clients 기능 전용 폼 유효성 검사 스키마
// Prefix 네이밍 컨벤션: client_ 사용

export const clientFormSchema = z.object({
  fullName: z.string().min(2, '이름은 2자 이상이어야 합니다'), // schema와 일치
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // 빈 값 허용
      return /^010-\d{4}-\d{4}$/.test(val); // 값이 있으면 형식 검증
    }, '올바른 전화번호 형식이 아닙니다 (010-0000-0000)'),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  telecomProvider: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  height: z.number().min(1).max(300).optional(),
  weight: z.number().min(1).max(500).optional(),
  hasDrivingLicense: z.boolean().optional(),
  currentStageId: z.string(), // schema와 일치
  importance: z.enum(['high', 'medium', 'low']),
  referredById: z.string().optional(), // schema와 일치
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  // UI 전용 필드들 (계산됨)
  contractAmount: z.number().min(0).optional(),
  insuranceType: z.string().optional(),
  familySize: z.number().min(1).optional(),
  childrenAges: z.array(z.number()).optional(),
  vehicleType: z.string().optional(),
  drivingExperience: z.number().min(0).optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

// 클라이언트 기본 정보 수정 스키마
export const clientBasicInfoSchema = z.object({
  fullName: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // 빈 값 허용
      return /^010-\d{4}-\d{4}$/.test(val); // 값이 있으면 형식 검증
    }, '올바른 전화번호 형식이 아닙니다'),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  telecomProvider: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  height: z.number().min(1).max(300).optional(),
  weight: z.number().min(1).max(500).optional(),
  hasDrivingLicense: z.boolean().optional(),
  notes: z.string().optional(),
});

// 클라이언트 영업 정보 스키마
export const clientSalesInfoSchema = z.object({
  currentStageId: z.string(),
  importance: z.enum(['high', 'medium', 'low']),
  referredById: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// 클라이언트 선호도 스키마
export const clientPreferencesSchema = z.object({
  preferredContactMethod: z.enum([
    'phone',
    'email',
    'kakao',
    'sms',
    'in_person',
    'video_call',
  ]),
  preferredContactTime: z
    .object({
      start: z.string(),
      end: z.string(),
      days: z.array(z.number().min(0).max(6)),
    })
    .optional(),
  communicationStyle: z.enum(['formal', 'casual', 'technical']).optional(),
  interests: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
  budget: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().default('KRW'),
    })
    .optional(),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  investmentGoals: z.array(z.string()).optional(),
  specialNeeds: z.string().optional(),
  notes: z.string().optional(),
});

// 📝 폼 옵션들 (prefix 네이밍 적용)
export const clientFormOptions = {
  // 통신사 옵션 (🔧 UI와 일치하도록 표준화)
  telecomProviders: [
    'SKT',
    'KT',
    'LG U+',
    '알뜰폰 SKT',
    '알뜰폰 KT',
    '알뜰폰 LG U+',
  ],

  // 영업 단계 옵션 (실제로는 DB에서 가져와야 함)
  stages: ['첫 상담', '니즈 분석', '상품 설명', '계약 검토', '계약 완료'],

  // 중요도 옵션
  importance: [
    { value: 'high', label: '높음' },
    { value: 'medium', label: '보통' },
    { value: 'low', label: '낮음' },
  ],

  // 연락 방법 옵션
  contactMethods: [
    { value: 'phone', label: '전화' },
    { value: 'email', label: '이메일' },
    { value: 'kakao', label: '카카오톡' },
    { value: 'sms', label: 'SMS' },
    { value: 'in_person', label: '대면' },
    { value: 'video_call', label: '화상통화' },
  ],

  // 공통 태그 제안
  commonTags: [
    '키맨',
    '기업',
    '개인',
    '잠재',
    '진행중',
    '완료',
    '교육보험',
    '고액',
    '자영업',
    '투자형',
    '학생',
    '저예산',
    '전문직',
    '세금절약',
    '영향력자',
    '소개자',
    '공무원',
    '교육',
    '안정형',
    '금융업',
    '복합상품',
  ],

  // 보험 유형 옵션
  insuranceTypes: [
    { value: 'life', label: '생명보험' },
    { value: 'health', label: '건강보험' },
    { value: 'auto', label: '자동차보험' },
    { value: 'prenatal', label: '태아보험' },
    { value: 'property', label: '재산보험' },
    { value: 'other', label: '기타' },
  ],

  // 차량 종류 옵션
  vehicleTypes: ['승용차', 'SUV', '화물차', '승합차', '오토바이', '기타'],

  // 소통 스타일 옵션
  communicationStyles: [
    { value: 'formal', label: '격식적' },
    { value: 'casual', label: '친근한' },
    { value: 'technical', label: '전문적' },
  ],

  // 위험 성향 옵션
  riskTolerances: [
    { value: 'conservative', label: '안전형' },
    { value: 'moderate', label: '중간형' },
    { value: 'aggressive', label: '적극형' },
  ],
};

// 기존 호환성을 위한 export
export const formOptions = clientFormOptions;
export const stageOptions = clientFormOptions.stages.map((stage) => ({
  value: stage,
  label: stage,
}));
export const importanceOptions = clientFormOptions.importance;
export const insuranceTypeOptions = clientFormOptions.insuranceTypes;
export const vehicleTypeOptions = clientFormOptions.vehicleTypes.map(
  (type) => ({
    value: type.toLowerCase().replace(/\s+/g, '_'),
    label: type,
  })
);
