import { db } from '../../core/db';
import { faqs } from '../../schema';
import { eq, and } from 'drizzle-orm';

// FAQ 데이터 타입
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order?: number;
  viewCount?: number;
  isPublished?: boolean;
  language?: string;
  authorId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// FAQ 카테고리 타입
export interface FAQCategory {
  category: string;
  faqs: FAQ[];
}

/**
 * FAQ 데이터 가져오기 (카테고리별로 그룹화)
 */
export async function getFAQs(): Promise<FAQCategory[]> {
  try {
    const faqData = await db
      .select({
        id: faqs.id,
        question: faqs.question,
        answer: faqs.answer,
        category: faqs.category,
        order: faqs.order,
        viewCount: faqs.viewCount,
      })
      .from(faqs)
      .where(and(eq(faqs.isPublished, true), eq(faqs.language, 'ko')))
      .orderBy(faqs.category, faqs.order, faqs.question);

    // 카테고리별로 그룹화
    const groupedFAQs = faqData.reduce((acc, faq) => {
      const existingCategory = acc.find(cat => cat.category === faq.category);
      const faqWithDefaults = {
        ...faq,
        isPublished: true,
        language: 'ko' as const,
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (existingCategory) {
        existingCategory.faqs.push(faqWithDefaults);
      } else {
        acc.push({
          category: faq.category,
          faqs: [faqWithDefaults],
        });
      }
      return acc;
    }, [] as FAQCategory[]);

    return groupedFAQs;
  } catch (error) {
    console.error('FAQ 조회 실패:', error);
    return getDefaultFAQs();
  }
}

/**
 * 기본 FAQ 데이터
 */
function getDefaultFAQs(): FAQCategory[] {
  return [
    {
      category: 'mvp',
      faqs: [
        {
          id: '1',
          question: 'SureCRM은 어떤 서비스인가요?',
          answer:
            'SureCRM은 보험설계사를 위한 전문 CRM SaaS 솔루션입니다. 고객 관리, 소개 네트워크 추적, 영업 파이프라인 관리 등을 통해 보험설계사의 업무 효율성을 극대화합니다. 현재 MVP 버전을 제공하고 있습니다.',
          category: 'mvp',
          order: 1,
          isPublished: true,
          language: 'ko',
          authorId: null,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          question: '초대장이 없으면 가입할 수 없나요?',
          answer:
            '네, 현재 SureCRM MVP는 초대장을 가진 사용자만 가입하여 사용할 수 있습니다. 이는 초기 사용자 피드백을 받아 서비스 품질을 향상시키기 위한 운영 방식입니다.',
          category: 'mvp',
          order: 2,
          isPublished: true,
          language: 'ko',
          authorId: null,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          question: 'MVP 버전이라 비용이 드나요?',
          answer:
            '아니요, 현재 MVP 버전은 완전 무료로 제공되고 있습니다. 정식 출시 시의 가격 정책은 아직 설정하지 않았으며, 사용자 피드백과 시장 상황을 고려하여 결정할 예정입니다.',
          category: 'mvp',
          order: 3,
          isPublished: true,
          language: 'ko',
          authorId: null,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      category: 'feedback',
      faqs: [
        {
          id: '4',
          question: '버그를 발견했을 때 어떻게 신고하나요?',
          answer:
            'MVP 운영 중이므로 버그 제보를 적극적으로 받고 있습니다! 서비스 내 피드백 기능을 이용하시거나, 설정 페이지에서 문의사항을 남겨주세요. 빠른 시일 내에 해결하여 업데이트하겠습니다.',
          category: 'feedback',
          order: 1,
          isPublished: true,
          language: 'ko',
          authorId: null,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '5',
          question: '새로운 기능을 요청할 수 있나요?',
          answer:
            '물론입니다! 보험설계사 업무에 도움이 되는 기능이라면 언제든 제안해 주세요. 실제 현장에서 필요한 기능들을 우선적으로 개발하여 최대한 빠르게 반영하고 있습니다.',
          category: 'feedback',
          order: 2,
          isPublished: true,
          language: 'ko',
          authorId: null,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '6',
          question: '업데이트는 얼마나 자주 이루어지나요?',
          answer:
            'MVP 기간 중에는 사용자 피드백을 반영하여 가능한 한 빠르게 업데이트하고 있습니다. 중요한 버그 수정은 즉시, 새로운 기능은 주 단위로 업데이트를 진행하고 있습니다.',
          category: 'feedback',
          order: 3,
          isPublished: true,
          language: 'ko',
          authorId: null,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
  ];
}
