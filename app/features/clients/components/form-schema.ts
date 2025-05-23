import * as z from 'zod';

// 유효성 검사 스키마
export const clientFormSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  phone: z
    .string()
    .regex(
      /^010-\d{4}-\d{4}$/,
      '올바른 전화번호 형식이 아닙니다 (010-0000-0000)'
    ),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  telecomProvider: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  height: z.number().min(1).max(300).optional(),
  weight: z.number().min(1).max(500).optional(),
  hasDrivingLicense: z.boolean().optional(),
  stage: z.string(),
  importance: z.enum(['high', 'medium', 'low']),
  referredBy: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  contractAmount: z.number().min(0).optional(),
  insuranceType: z.string().optional(),
  familySize: z.number().min(1).optional(),
  childrenAges: z.array(z.number()).optional(),
  vehicleType: z.string().optional(),
  drivingExperience: z.number().min(0).optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

// 폼 옵션들
export const formOptions = {
  // 통신사 옵션
  telecomProviders: [
    'SK텔레콤',
    'KT',
    'LG U+',
    '알뜰폰(SK)',
    '알뜰폰(KT)',
    '알뜰폰(LG)',
  ],

  // 영업 단계 옵션
  stages: ['첫 상담', '니즈 분석', '상품 설명', '계약 검토', '계약 완료'],

  // 중요도 옵션
  importance: [
    { value: 'high', label: '높음' },
    { value: 'medium', label: '보통' },
    { value: 'low', label: '낮음' },
  ],

  // 공통 태그 제안
  commonTags: [
    'VIP',
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
};

// 영업 단계 옵션 (기존 호환성)
export const stageOptions = formOptions.stages.map((stage) => ({
  value: stage,
  label: stage,
}));

// 중요도 옵션 (기존 호환성)
export const importanceOptions = formOptions.importance;

// 보험 유형 옵션 (기존 호환성)
export const insuranceTypeOptions = formOptions.insuranceTypes;

// 차량 종류 옵션 (기존 호환성)
export const vehicleTypeOptions = formOptions.vehicleTypes.map((type) => ({
  value: type.toLowerCase().replace(/\s+/g, '_'),
  label: type,
}));
