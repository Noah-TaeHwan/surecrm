import { db } from '~/lib/db';
import {
  commonProfiles,
  commonTeams,
  commonSystemSettings,
  commonTeamSettings,
  commonUserSettings,
  commonFaqs,
  commonPublicContents,
  commonSiteSettings,
  commonTestimonials,
  commonAnnouncements,
  commonFeatureFlags,
  commonApiKeys,
  commonIntegrations,
  commonBackupConfigurations,
} from './schema';

// 🎯 어드민 계정 정보 (Supabase auth.users와 연결)
const ADMIN_USER_ID = '80b0993a-4194-4165-be5a-aec24b88cd80';

export async function seedCommonData() {
  console.log('🌱 공통 데이터 시드 시작...');

  try {
    // 1. 어드민 프로필 생성
    const [adminProfile] = await db
      .insert(commonProfiles)
      .values({
        id: ADMIN_USER_ID,
        fullName: '관리자',
        phone: '010-1234-5678',
        company: 'SureCRM',
        role: 'system_admin',
        invitationsLeft: 100,
        settings: {
          theme: 'dark',
          language: 'ko',
          timezone: 'Asia/Seoul',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    console.log('✅ 어드민 프로필 생성 완료');

    // 2. 기본 팀 생성
    const [defaultTeam] = await db
      .insert(commonTeams)
      .values({
        name: 'SureCRM 본사',
        description: '메인 팀 - 모든 기능에 대한 전체 권한',
        adminId: ADMIN_USER_ID,
        settings: {
          workingHours: {
            start: '09:00',
            end: '18:00',
            days: [1, 2, 3, 4, 5], // 월-금
          },
          timezone: 'Asia/Seoul',
          features: {
            calendar: true,
            clients: true,
            dashboard: true,
            influencers: true,
            invitations: true,
            network: true,
            notifications: true,
            pipeline: true,
            reports: true,
            settings: true,
            team: true,
          },
        },
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    console.log('✅ 기본 팀 생성 완료');

    // 3. 시스템 설정
    await db
      .insert(commonSystemSettings)
      .values([
        {
          category: 'general',
          key: 'app_name',
          value: '"SureCRM"',
          type: 'string',
          description: '애플리케이션 이름',
          isPublic: true,
          updatedBy: ADMIN_USER_ID,
        },
        {
          category: 'general',
          key: 'app_version',
          value: '"1.0.0"',
          type: 'string',
          description: '애플리케이션 버전',
          isPublic: true,
          updatedBy: ADMIN_USER_ID,
        },
        {
          category: 'general',
          key: 'maintenance_mode',
          value: 'false',
          type: 'boolean',
          description: '유지보수 모드 활성화 여부',
          isPublic: false,
          updatedBy: ADMIN_USER_ID,
        },
        {
          category: 'notifications',
          key: 'email_notifications_enabled',
          value: 'true',
          type: 'boolean',
          description: '이메일 알림 활성화 여부',
          isPublic: false,
          updatedBy: ADMIN_USER_ID,
        },
        {
          category: 'security',
          key: 'session_timeout',
          value: '3600',
          type: 'number',
          description: '세션 타임아웃 (초)',
          isPublic: false,
          updatedBy: ADMIN_USER_ID,
        },
        {
          category: 'integrations',
          key: 'google_calendar_enabled',
          value: 'true',
          type: 'boolean',
          description: '구글 캘린더 연동 활성화 여부',
          isPublic: false,
          updatedBy: ADMIN_USER_ID,
        },
      ])
      .onConflictDoNothing();

    console.log('✅ 시스템 설정 생성 완료');

    // 4. 사용자 설정
    await db
      .insert(commonUserSettings)
      .values({
        userId: ADMIN_USER_ID,
        category: 'general',
        key: 'user_preferences',
        value: {
          theme: 'dark',
          language: 'ko',
          timezone: 'Asia/Seoul',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
        },
        type: 'json',
        description: '사용자 기본 설정',
      })
      .onConflictDoNothing();

    console.log('✅ 사용자 설정 생성 완료');

    // 5. FAQ 데이터
    await db
      .insert(commonFaqs)
      .values([
        {
          question: 'SureCRM은 어떤 서비스인가요?',
          answer:
            'SureCRM은 보험 에이전트를 위한 종합 고객 관계 관리 시스템입니다. 고객 관리, 일정 관리, 네트워크 분석, 파이프라인 관리 등의 기능을 제공합니다.',
          category: 'general',
          order: 1,
          isPublished: true,
          language: 'ko',
          authorId: ADMIN_USER_ID,
          viewCount: 0,
        },
        {
          question: '팀 초대는 어떻게 하나요?',
          answer:
            '설정 > 팀 관리에서 초대 코드를 생성하거나 이메일로 직접 초대할 수 있습니다. 초대받은 사용자는 초대 링크를 통해 가입할 수 있습니다.',
          category: 'team',
          order: 2,
          isPublished: true,
          language: 'ko',
          authorId: ADMIN_USER_ID,
          viewCount: 0,
        },
        {
          question: '구글 캘린더와 연동이 가능한가요?',
          answer:
            '네, 가능합니다. 설정 > 통합에서 구글 캘린더를 연결하면 일정이 자동으로 동기화됩니다.',
          category: 'integrations',
          order: 3,
          isPublished: true,
          language: 'ko',
          authorId: ADMIN_USER_ID,
          viewCount: 0,
        },
        {
          question: '데이터 백업은 어떻게 되나요?',
          answer:
            '모든 데이터는 안전하게 암호화되어 저장되며, 정기적으로 백업됩니다. 팀 관리자는 설정에서 백업 주기를 조정할 수 있습니다.',
          category: 'security',
          order: 4,
          isPublished: true,
          language: 'ko',
          authorId: ADMIN_USER_ID,
          viewCount: 0,
        },
      ])
      .onConflictDoNothing();

    console.log('✅ FAQ 데이터 생성 완료');

    // 6. 공개 콘텐츠
    await db
      .insert(commonPublicContents)
      .values([
        {
          type: 'terms_of_service',
          title: '서비스 이용약관',
          content: `
# SureCRM 서비스 이용약관

## 제1조 (목적)
본 약관은 SureCRM(이하 "회사")이 제공하는 서비스의 이용조건 및 절차, 회사와 이용자의 권리, 의무, 책임사항을 규정함을 목적으로 합니다.

## 제2조 (정의)
1. "서비스"란 회사가 제공하는 CRM 플랫폼 및 관련 서비스를 의미합니다.
2. "이용자"란 본 약관에 따라 회사의 서비스를 받는 회원 및 비회원을 의미합니다.

## 제3조 (약관의 효력 및 변경)
1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
2. 회사는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 공지합니다.
          `,
          version: '1.0',
          language: 'ko',
          status: 'published',
          effectiveDate: new Date().toISOString(),
          authorId: ADMIN_USER_ID,
          metadata: {
            lastReviewed: new Date().toISOString(),
            reviewedBy: ADMIN_USER_ID,
          },
        },
        {
          type: 'privacy_policy',
          title: '개인정보처리방침',
          content: `
# 개인정보처리방침

## 1. 개인정보의 처리목적
SureCRM은 다음의 목적을 위하여 개인정보를 처리합니다.

### 가. 서비스 제공
- 고객 관리 서비스 제공
- 일정 관리 및 알림 서비스
- 네트워크 분석 서비스

### 나. 회원 관리
- 회원 가입의사 확인
- 개인 식별
- 불량회원의 부정 이용 방지

## 2. 개인정보의 처리 및 보유기간
회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
          `,
          version: '1.0',
          language: 'ko',
          status: 'published',
          effectiveDate: new Date().toISOString(),
          authorId: ADMIN_USER_ID,
          metadata: {
            lastReviewed: new Date().toISOString(),
            reviewedBy: ADMIN_USER_ID,
          },
        },
      ])
      .onConflictDoNothing();

    console.log('✅ 공개 콘텐츠 생성 완료');

    // 7. 사이트 설정
    await db
      .insert(commonSiteSettings)
      .values([
        {
          key: 'site_title',
          value: 'SureCRM - 보험 에이전트를 위한 CRM',
          type: 'string',
          description: '사이트 제목',
          isPublic: true,
          updatedBy: ADMIN_USER_ID,
        },
        {
          key: 'site_description',
          value: '보험 에이전트를 위한 종합 고객 관계 관리 시스템',
          type: 'string',
          description: '사이트 설명',
          isPublic: true,
          updatedBy: ADMIN_USER_ID,
        },
        {
          key: 'contact_email',
          value: 'support@surecrm.co.kr',
          type: 'string',
          description: '고객 지원 이메일',
          isPublic: true,
          updatedBy: ADMIN_USER_ID,
        },
        {
          key: 'contact_phone',
          value: '1588-1234',
          type: 'string',
          description: '고객 지원 전화번호',
          isPublic: true,
          updatedBy: ADMIN_USER_ID,
        },
      ])
      .onConflictDoNothing();

    console.log('✅ 사이트 설정 생성 완료');

    // 8. 고객 후기
    await db
      .insert(commonTestimonials)
      .values([
        {
          name: '김영희',
          role: '시니어 보험 에이전트',
          company: '삼성생명',
          quote:
            'SureCRM 덕분에 고객 관리가 훨씬 체계적이 되었습니다. 특히 네트워크 분석 기능이 정말 유용해요.',
          rating: 5,
          initial: '김',
          isVerified: true,
          isPublished: true,
          order: 1,
          language: 'ko',
          authorId: ADMIN_USER_ID,
        },
        {
          name: '박민수',
          role: '팀장',
          company: '교보생명',
          quote:
            '팀 관리 기능이 정말 좋습니다. 팀원들의 성과를 한눈에 볼 수 있어서 관리가 편해졌어요.',
          rating: 5,
          initial: '박',
          isVerified: true,
          isPublished: true,
          order: 2,
          language: 'ko',
          authorId: ADMIN_USER_ID,
        },
        {
          name: '이수진',
          role: '보험 에이전트',
          company: '한화생명',
          quote:
            '일정 관리와 고객 관리를 한 곳에서 할 수 있어서 정말 편리합니다. 추천합니다!',
          rating: 4,
          initial: '이',
          isVerified: true,
          isPublished: true,
          order: 3,
          language: 'ko',
          authorId: ADMIN_USER_ID,
        },
      ])
      .onConflictDoNothing();

    console.log('✅ 고객 후기 생성 완료');

    // 9. 공지사항
    await db
      .insert(commonAnnouncements)
      .values([
        {
          title: 'SureCRM 베타 서비스 오픈!',
          content: `
안녕하세요, SureCRM 팀입니다.

드디어 SureCRM 베타 서비스를 오픈하게 되었습니다! 🎉

## 주요 기능
- 📅 **일정 관리**: 구글 캘린더 연동으로 편리한 일정 관리
- 👥 **고객 관리**: 체계적인 고객 정보 관리 및 분석
- 🌐 **네트워크 분석**: 인맥 네트워크 시각화 및 분석
- 📊 **대시보드**: 한눈에 보는 성과 분석
- 🔄 **파이프라인**: 영업 프로세스 관리

많은 관심과 피드백 부탁드립니다!

감사합니다.
          `,
          type: 'announcement',
          priority: 1,
          isPublished: true,
          isPinned: true,
          language: 'ko',
          authorId: ADMIN_USER_ID,
          publishedAt: new Date().toISOString(),
        },
        {
          title: '시스템 점검 안내',
          content: `
시스템 안정성 향상을 위한 정기 점검을 실시합니다.

**점검 일시**: 2024년 1월 15일 (월) 02:00 ~ 04:00
**점검 내용**: 
- 데이터베이스 최적화
- 보안 업데이트
- 성능 개선

점검 시간 중에는 서비스 이용이 일시적으로 제한될 수 있습니다.
이용에 불편을 드려 죄송합니다.
          `,
          type: 'maintenance',
          priority: 2,
          isPublished: true,
          isPinned: false,
          language: 'ko',
          authorId: ADMIN_USER_ID,
          publishedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30일 후
        },
      ])
      .onConflictDoNothing();

    console.log('✅ 공지사항 생성 완료');

    // 10. 기능 플래그
    await db
      .insert(commonFeatureFlags)
      .values([
        {
          name: 'google_calendar_integration',
          description: '구글 캘린더 연동 기능',
          isEnabled: true,
          rolloutPercentage: 100,
          createdBy: ADMIN_USER_ID,
        },
        {
          name: 'advanced_analytics',
          description: '고급 분석 기능',
          isEnabled: true,
          rolloutPercentage: 50,
          targetUsers: [ADMIN_USER_ID],
          createdBy: ADMIN_USER_ID,
        },
        {
          name: 'team_collaboration',
          description: '팀 협업 기능',
          isEnabled: true,
          rolloutPercentage: 100,
          createdBy: ADMIN_USER_ID,
        },
        {
          name: 'mobile_app',
          description: '모바일 앱 기능',
          isEnabled: false,
          rolloutPercentage: 0,
          createdBy: ADMIN_USER_ID,
        },
      ])
      .onConflictDoNothing();

    console.log('✅ 기능 플래그 생성 완료');

    console.log('🎉 공통 데이터 시드 완료!');
  } catch (error) {
    console.error('❌ 공통 데이터 시드 실패:', error);
    throw error;
  }
}

// 개별 실행을 위한 함수
if (require.main === module) {
  seedCommonData()
    .then(() => {
      console.log('✅ 공통 시드 데이터 생성 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 공통 시드 데이터 생성 실패:', error);
      process.exit(1);
    });
}
