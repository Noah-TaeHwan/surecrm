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
      category: 'general',
      faqs: [
        {
          id: '1',
          question: 'SureCRM은 무료로 사용할 수 있나요?',
          answer:
            '초대를 통해 가입한 사용자는 베타 기간 동안 모든 기능을 무료로 이용할 수 있습니다. 정식 출시 후에는 기본 기능은 계속 무료로 제공되며, 고급 기능은 유료 플랜으로 제공될 예정입니다.',
          category: 'general',
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
          question: '어떻게 초대를 받을 수 있나요?',
          answer:
            '현재 SureCRM은 초대 전용 베타 서비스입니다. 이미 사용 중인 보험설계사로부터 초대를 받아 사용하실 수 있습니다.',
          category: 'general',
          order: 2,
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
      category: 'data',
      faqs: [
        {
          id: '3',
          question: '기존 고객 데이터를 가져올 수 있나요?',
          answer:
            '네, CSV, 엑셀 파일에서 고객 데이터를 쉽게 가져올 수 있습니다. 또한 구글 연락처와의 연동도 지원합니다. 가져온 후에는 소개 관계를 설정하는 직관적인 인터페이스를 제공합니다.',
          category: 'data',
          order: 1,
          isPublished: true,
          language: 'ko',
          authorId: null,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          question: '데이터는 안전하게 보관되나요?',
          answer:
            '고객의 개인정보 보호는 최우선 과제입니다. 모든 데이터는 암호화되어 저장되며, 해당 사용자만 접근할 수 있습니다. 개인정보 취급방침에 따라 엄격하게 관리됩니다.',
          category: 'data',
          order: 2,
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
