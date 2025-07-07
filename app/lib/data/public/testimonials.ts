import { db } from '../../core/db.server';
import schema from '../../schema/all';
import { eq, and, desc } from 'drizzle-orm';

// 후기 데이터 타입
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  initial: string;
  isVerified: boolean;
}

/**
 * 랜딩 페이지용 후기 데이터 가져오기
 * 실제 데이터베이스에서 조회
 */
export async function getPublicTestimonials(): Promise<Testimonial[]> {
  try {
    const dbTestimonials = await db
      .select({
        id: schema.testimonials.id,
        name: schema.testimonials.name,
        role: schema.testimonials.role,
        company: schema.testimonials.company,
        quote: schema.testimonials.quote,
        rating: schema.testimonials.rating,
        initial: schema.testimonials.initial,
        isVerified: schema.testimonials.isVerified,
      })
      .from(schema.testimonials)
      .where(
        and(
          eq(schema.testimonials.isPublished, true),
          eq(schema.testimonials.language, 'ko')
        )
      )
      .orderBy(
        desc(schema.testimonials.order),
        desc(schema.testimonials.createdAt)
      )
      .limit(8);

    // Drizzle-orm은 number | null 타입을 반환할 수 있으므로, 타입을 명시적으로 맞춰줍니다.
    return dbTestimonials.map(t => ({
      ...t,
      rating: t.rating ?? 5, // rating이 null이면 기본값 5를 사용
    }));
  } catch (error) {
    console.error('후기 데이터 조회 실패:', error);
    // 에러 시 기본값 반환 (기존 로직 유지)
    return [
      {
        id: '1',
        name: '김영수',
        role: '수석 보험설계사',
        company: '메리츠화재',
        quote:
          'SureCRM 덕분에 소개 네트워크를 체계적으로 관리할 수 있게 되었습니다. 매월 신규 고객이 30% 이상 증가했어요.',
        rating: 5,
        initial: '김',
        isVerified: true,
      },
      {
        id: '2',
        name: '박지은',
        role: '팀장',
        company: '삼성생명',
        quote:
          '팀원들과 고객 정보를 공유하고 협업하기가 훨씬 쉬워졌습니다. 특히 소개 관계 시각화 기능이 정말 유용해요.',
        rating: 5,
        initial: '박',
        isVerified: true,
      },
      {
        id: '3',
        name: '최민호',
        role: '지점장',
        company: '현대해상',
        quote:
          '데이터 기반의 고객 관리로 성과가 눈에 띄게 향상되었습니다. 특히 레퍼럴 추적 기능이 정말 유용해요.',
        rating: 5,
        initial: '최',
        isVerified: true,
      },
      {
        id: '4',
        name: '이수진',
        role: '팀 리더',
        company: '롯데손해보험',
        quote:
          '직관적인 인터페이스로 팀원들이 빠르게 적응했고, 업무 효율성이 크게 개선되었습니다.',
        rating: 5,
        initial: '이',
        isVerified: true,
      },
      {
        id: '5',
        name: '정태웅',
        role: '선임 설계사',
        company: 'DB손해보험',
        quote:
          'AI 추천 기능이 정말 정확해서 고객에게 맞는 상품을 쉽게 찾을 수 있어요. 계약 성사율이 40% 증가했습니다.',
        rating: 5,
        initial: '정',
        isVerified: true,
      },
      {
        id: '6',
        name: '강미영',
        role: '지역 책임자',
        company: '한화손해보험',
        quote:
          '실시간 알림과 일정 관리 기능 덕분에 중요한 미팅을 놓치는 일이 없어졌어요. 고객 만족도도 크게 향상되었습니다.',
        rating: 5,
        initial: '강',
        isVerified: true,
      },
    ];
  }
}
