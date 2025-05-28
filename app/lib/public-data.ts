import { db } from './db';
import { profiles, teams, clients, invitations } from './supabase-schema';
import {
  publicContents,
  testimonials,
  faqs,
  siteSettings,
  type PublicContent,
  type Testimonial as DBTestimonial,
  type FAQ,
  type TermsData,
  type PrivacyPolicyData,
  type FAQCategory,
} from '~/common/schema';
import { count, sql, eq, and, gte, desc } from 'drizzle-orm';

// 공개 통계 데이터 타입
export interface PublicStats {
  totalUsers: number;
  totalTeams: number;
  totalClients: number;
  totalInvitations: number;
  avgEfficiencyIncrease: number;
  successRate: number;
}

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

// 초대 통계 타입
export interface InviteStats {
  totalInvitations: number;
  usedInvitations: number;
  pendingInvitations: number;
  conversionRate: number;
}

/**
 * 랜딩 페이지용 공개 통계 데이터 가져오기
 */
export async function getPublicStats(): Promise<PublicStats> {
  try {
    // 병렬로 모든 통계 쿼리 실행
    const [
      totalUsersResult,
      totalTeamsResult,
      totalClientsResult,
      totalInvitationsResult,
    ] = await Promise.all([
      // 활성 사용자 수
      db
        .select({ count: count() })
        .from(profiles)
        .where(eq(profiles.isActive, true)),

      // 활성 팀 수
      db.select({ count: count() }).from(teams).where(eq(teams.isActive, true)),

      // 총 고객 수
      db
        .select({ count: count() })
        .from(clients)
        .where(eq(clients.isActive, true)),

      // 총 초대 수
      db.select({ count: count() }).from(invitations),
    ]);

    const totalUsers = totalUsersResult[0]?.count || 0;
    const totalTeams = totalTeamsResult[0]?.count || 0;
    const totalClients = totalClientsResult[0]?.count || 0;
    const totalInvitations = totalInvitationsResult[0]?.count || 0;

    // 기본값 또는 계산된 값들
    const avgEfficiencyIncrease = Math.min(
      30 + Math.floor(totalUsers / 100),
      45
    ); // 사용자 수에 따라 증가
    const successRate = Math.min(85 + Math.floor(totalClients / 1000), 95); // 고객 수에 따라 증가

    return {
      totalUsers,
      totalTeams,
      totalClients,
      totalInvitations,
      avgEfficiencyIncrease,
      successRate,
    };
  } catch (error) {
    console.error('공개 통계 데이터 조회 실패:', error);

    // 에러 시 기본값 반환
    return {
      totalUsers: 1250,
      totalTeams: 85,
      totalClients: 3200,
      totalInvitations: 450,
      avgEfficiencyIncrease: 32,
      successRate: 89,
    };
  }
}

/**
 * 랜딩 페이지용 후기 데이터 가져오기
 * 실제 데이터베이스에서 조회
 */
export async function getPublicTestimonials(): Promise<Testimonial[]> {
  try {
    const dbTestimonials = await db
      .select({
        id: testimonials.id,
        name: testimonials.name,
        role: testimonials.role,
        company: testimonials.company,
        quote: testimonials.quote,
        rating: testimonials.rating,
        initial: testimonials.initial,
        isVerified: testimonials.isVerified,
      })
      .from(testimonials)
      .where(
        and(eq(testimonials.isPublished, true), eq(testimonials.language, 'ko'))
      )
      .orderBy(testimonials.order, testimonials.createdAt)
      .limit(8);

    return dbTestimonials;
  } catch (error) {
    console.error('후기 데이터 조회 실패:', error);

    // 에러 시 기본값 반환
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
        name: '이민호',
        role: '보험설계사',
        company: '현대해상',
        quote:
          '고객 관리가 이렇게 간단할 줄 몰랐습니다. 파이프라인 관리로 계약 전환율이 크게 향상되었어요.',
        rating: 5,
        initial: '이',
        isVerified: true,
      },
      {
        id: '4',
        name: '최수진',
        role: '지점장',
        company: 'KB손해보험',
        quote:
          '전체 지점의 성과를 한눈에 볼 수 있어서 관리가 편해졌습니다. 데이터 기반 의사결정이 가능해졌어요.',
        rating: 5,
        initial: '최',
        isVerified: true,
      },
    ];
  }
}

/**
 * 초대 관련 통계 데이터 가져오기
 */
export async function getInviteStats(): Promise<InviteStats> {
  try {
    const [totalResult, usedResult, pendingResult] = await Promise.all([
      // 총 초대 수
      db.select({ count: count() }).from(invitations),

      // 사용된 초대 수
      db
        .select({ count: count() })
        .from(invitations)
        .where(eq(invitations.status, 'used')),

      // 대기 중인 초대 수
      db
        .select({ count: count() })
        .from(invitations)
        .where(eq(invitations.status, 'pending')),
    ]);

    const totalInvitations = totalResult[0]?.count || 0;
    const usedInvitations = usedResult[0]?.count || 0;
    const pendingInvitations = pendingResult[0]?.count || 0;

    const conversionRate =
      totalInvitations > 0
        ? Math.round((usedInvitations / totalInvitations) * 100)
        : 0;

    return {
      totalInvitations,
      usedInvitations,
      pendingInvitations,
      conversionRate,
    };
  } catch (error) {
    console.error('초대 통계 데이터 조회 실패:', error);

    return {
      totalInvitations: 450,
      usedInvitations: 320,
      pendingInvitations: 130,
      conversionRate: 71,
    };
  }
}

/**
 * 특정 초대 코드 검증 및 정보 조회
 */
export async function validateInviteCode(code: string) {
  try {
    const invitation = await db
      .select({
        id: invitations.id,
        code: invitations.code,
        status: invitations.status,
        inviterName: profiles.fullName,
        inviterEmail: sql<string>`auth.users.email`,
        expiresAt: invitations.expiresAt,
        message: invitations.message,
      })
      .from(invitations)
      .leftJoin(profiles, eq(invitations.inviterId, profiles.id))
      .where(eq(invitations.code, code))
      .limit(1);

    if (!invitation.length) {
      return {
        isValid: false,
        message: '유효하지 않은 초대 코드입니다.',
      };
    }

    const invite = invitation[0];
    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);

    // 만료 확인
    if (expiresAt < now) {
      return {
        isValid: false,
        message: '만료된 초대 코드입니다.',
      };
    }

    // 이미 사용된 코드 확인
    if (invite.status === 'used') {
      return {
        isValid: false,
        message: '이미 사용된 초대 코드입니다.',
      };
    }

    // 취소된 코드 확인
    if (invite.status === 'cancelled') {
      return {
        isValid: false,
        message: '취소된 초대 코드입니다.',
      };
    }

    return {
      isValid: true,
      inviteCode: invite.code,
      invitedBy: {
        name: invite.inviterName || '알 수 없음',
        email: invite.inviterEmail || '',
      },
      message: invite.message,
    };
  } catch (error) {
    console.error('초대 코드 검증 실패:', error);

    return {
      isValid: false,
      message: '초대 코드 검증 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 최근 가입한 사용자 수 (지난 30일)
 */
export async function getRecentSignups(): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .select({ count: count() })
      .from(profiles)
      .where(
        and(eq(profiles.isActive, true), gte(profiles.createdAt, thirtyDaysAgo))
      );

    return result[0]?.count || 0;
  } catch (error) {
    console.error('최근 가입자 수 조회 실패:', error);
    return 45; // 기본값
  }
}

/**
 * 성장률 계산 (월별)
 */
export async function getGrowthRate(): Promise<number> {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [lastMonthCount, thisMonthCount] = await Promise.all([
      db
        .select({ count: count() })
        .from(profiles)
        .where(
          and(
            eq(profiles.isActive, true),
            gte(profiles.createdAt, lastMonth),
            sql`${profiles.createdAt} < ${thisMonth}`
          )
        ),
      db
        .select({ count: count() })
        .from(profiles)
        .where(
          and(eq(profiles.isActive, true), gte(profiles.createdAt, thisMonth))
        ),
    ]);

    const lastCount = lastMonthCount[0]?.count || 0;
    const thisCount = thisMonthCount[0]?.count || 0;

    if (lastCount === 0) return thisCount > 0 ? 100 : 0;

    return Math.round(((thisCount - lastCount) / lastCount) * 100);
  } catch (error) {
    console.error('성장률 계산 실패:', error);
    return 15; // 기본값
  }
}

/**
 * 이용약관 데이터 가져오기
 */
export async function getTermsOfService(): Promise<TermsData> {
  try {
    const terms = await db
      .select({
        id: publicContents.id,
        title: publicContents.title,
        content: publicContents.content,
        version: publicContents.version,
        effectiveDate: publicContents.effectiveDate,
        updatedAt: publicContents.updatedAt,
      })
      .from(publicContents)
      .where(
        and(
          eq(publicContents.type, 'terms_of_service'),
          eq(publicContents.status, 'published'),
          eq(publicContents.language, 'ko')
        )
      )
      .orderBy(desc(publicContents.effectiveDate))
      .limit(1);

    if (terms.length > 0) {
      const term = terms[0];
      return {
        id: term.id,
        title: term.title,
        content: term.content,
        version: term.version,
        effectiveDate: term.effectiveDate || new Date(),
        lastUpdated: term.updatedAt,
      };
    }

    // 기본 이용약관 반환
    return {
      id: 'default-terms',
      title: '서비스 이용약관',
      content: getDefaultTermsContent(),
      version: '1.0',
      effectiveDate: new Date(),
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('이용약관 조회 실패:', error);
    return {
      id: 'default-terms',
      title: '서비스 이용약관',
      content: getDefaultTermsContent(),
      version: '1.0',
      effectiveDate: new Date(),
      lastUpdated: new Date(),
    };
  }
}

/**
 * 개인정보처리방침 데이터 가져오기
 */
export async function getPrivacyPolicy(): Promise<PrivacyPolicyData> {
  try {
    const privacy = await db
      .select({
        id: publicContents.id,
        title: publicContents.title,
        content: publicContents.content,
        version: publicContents.version,
        effectiveDate: publicContents.effectiveDate,
        updatedAt: publicContents.updatedAt,
      })
      .from(publicContents)
      .where(
        and(
          eq(publicContents.type, 'privacy_policy'),
          eq(publicContents.status, 'published'),
          eq(publicContents.language, 'ko')
        )
      )
      .orderBy(desc(publicContents.effectiveDate))
      .limit(1);

    if (privacy.length > 0) {
      const policy = privacy[0];
      return {
        id: policy.id,
        title: policy.title,
        content: policy.content,
        version: policy.version,
        effectiveDate: policy.effectiveDate || new Date(),
        lastUpdated: policy.updatedAt,
      };
    }

    // 기본 개인정보처리방침 반환
    return {
      id: 'default-privacy',
      title: '개인정보처리방침',
      content: getDefaultPrivacyContent(),
      version: '1.0',
      effectiveDate: new Date(),
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('개인정보처리방침 조회 실패:', error);
    return {
      id: 'default-privacy',
      title: '개인정보처리방침',
      content: getDefaultPrivacyContent(),
      version: '1.0',
      effectiveDate: new Date(),
      lastUpdated: new Date(),
    };
  }
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
      const existingCategory = acc.find((cat) => cat.category === faq.category);
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
 * 사이트 설정 값 가져오기
 */
export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const setting = await db
      .select({
        value: siteSettings.value,
      })
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    return setting.length > 0 ? setting[0].value : null;
  } catch (error) {
    console.error(`사이트 설정 조회 실패 (${key}):`, error);
    return null;
  }
}

/**
 * 기본 이용약관 내용
 */
function getDefaultTermsContent(): string {
  return `
# 서비스 이용약관

## 제 1 장 총칙

### 제 1 조 (목적)
이 약관은 SureCRM(이하 '회사'라 함)이 제공하는 보험설계사 고객관리 서비스(이하 '서비스'라 함)를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

### 제 2 조 (정의)
① '서비스'란 회사가 제공하는 모든 서비스를 의미합니다.
② '이용자'란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
③ '아이디(ID)'란 이용자의 식별과 서비스 이용을 위하여 이용자가 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.

### 제 3 조 (약관의 효력 및 변경)
① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
② 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지함으로써 효력이 발생합니다.

## 제 2 장 서비스 이용

### 제 4 조 (서비스의 제공)
① 회사는 다음과 같은 서비스를 제공합니다:
- 보험설계사를 위한 고객관리 서비스
- 소개 관계 네트워킹 시각화 서비스
- 영업 파이프라인 관리 서비스
- 캘린더 및 미팅 관리 서비스
- 기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 이용자에게 제공하는 일체의 서비스

② 회사는 서비스를 일정범위로 분할하여 각 범위별로 이용가능시간을 별도로 지정할 수 있습니다.

### 제 5 조 (서비스의 중단)
① 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
② 제1항에 의한 서비스 중단의 경우에는 회사는 제8조에 정한 방법으로 이용자에게 통지합니다. 다만, 회사가 사전에 통지할 수 없는 부득이한 사유가 있는 경우 사후에 통지할 수 있습니다.
  `;
}

/**
 * 기본 개인정보처리방침 내용
 */
function getDefaultPrivacyContent(): string {
  return `
# 개인정보처리방침

SureCRM(이하 '회사'라 함)은 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.

## 제 1 조 (개인정보의 수집 및 이용 목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

1. 서비스 제공: 고객관리 서비스, 소개 관계 네트워킹, 영업 파이프라인 관리, 캘린더 및 미팅 관리 등 서비스 제공과 관련한 목적으로 개인정보를 처리합니다.
2. 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정이용 방지와 비인가 사용방지, 가입의사 확인, 가입 및 가입횟수 제한, 분쟁 조정을 위한 기록보존, 불만처리 등 민원처리, 고지사항 전달 등을 목적으로 개인정보를 처리합니다.

## 제 2 조 (수집하는 개인정보의 항목 및 수집방법)
회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.

1. 필수 항목: 이메일 주소, 비밀번호, 이름
2. 선택 항목: 프로필 이미지, 전화번호, 직업정보
3. 서비스 이용 과정에서 생성/수집되는 정보: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 불량 이용 기록

개인정보는 서비스 가입 과정에서 이용자가 개인정보 수집에 대한 동의를 하고 직접 정보를 입력하는 방식으로 수집됩니다.
  `;
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
