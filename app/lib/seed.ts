import { db } from './db';
import { eq, sql } from 'drizzle-orm';
import {
  teams,
  pipelineStages,
  clients,
  clientDetails,
  invitations,
  profiles,
} from './supabase-schema';

// 각 feature별 스키마 import (필요한 것만)
import { clientTags } from '../features/clients/schema';

// 공개 페이지 스키마 import
import {
  testimonials,
  faqs,
  publicContents,
  announcements,
  siteSettings,
} from '../common/schema';

// 초대장 함수 import
import { createInitialInvitations } from '../features/invitations/lib/invitations-data';

export async function seedDatabase() {
  console.log('🌱 시드 데이터 생성을 시작합니다...');

  try {
    // 0. 공개 페이지 데이터 먼저 생성 (인증 불필요)
    await seedPublicData();

    // 1. 메인 애플리케이션 데이터 생성
    await seedApplicationData();

    console.log('✅ 모든 시드 데이터 생성이 완료되었습니다!');
  } catch (error) {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', error);
    throw error;
  }
}

async function seedPublicData() {
  console.log('🌐 공개 페이지 데이터 생성 중...');

  // 사이트 설정 데이터
  console.log('⚙️ 사이트 설정 생성 중...');

  // 기존 사이트 설정 삭제 후 새로 삽입 (upsert 방식)
  await db.delete(siteSettings);

  await db.insert(siteSettings).values([
    {
      key: 'app_version',
      value: '1.0.0-beta',
      type: 'string',
      description: '앱 버전',
      isPublic: true,
    },
    {
      key: 'last_updated',
      value: '2024-12-19',
      type: 'string',
      description: '마지막 업데이트 날짜',
      isPublic: true,
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      description: '점검 모드',
      isPublic: false,
    },
    {
      key: 'beta_signup_enabled',
      value: 'true',
      type: 'boolean',
      description: '베타 가입 활성화',
      isPublic: true,
    },
  ]);

  // 후기 데이터
  console.log('�� 후기 데이터 생성 중...');

  // 기존 후기 데이터 삭제 후 새로 삽입 (upsert 방식)
  await db.delete(testimonials);

  await db.insert(testimonials).values([
    {
      name: '김영수',
      role: '보험설계사',
      company: '삼성생명',
      quote:
        'SureCRM 덕분에 고객 관리가 정말 체계적으로 변했어요. 소개 네트워크 기능이 특히 혁신적입니다.',
      rating: 5,
      initial: '김',
      isVerified: true,
      isPublished: true,
      order: 1,
    },
    {
      name: '박지현',
      role: '팀장',
      company: '한화생명',
      quote:
        '팀 전체의 성과가 한눈에 보여서 관리가 훨씬 쉬졌습니다. 데이터 기반 의사결정이 가능해졌어요.',
      rating: 5,
      initial: '박',
      isVerified: true,
      isPublished: true,
      order: 2,
    },
    {
      name: '이민호',
      role: '지점장',
      company: 'DB손해보험',
      quote:
        '소개 관계 시각화 기능이 정말 놀라워요. 네트워크 효과를 실제로 확인할 수 있습니다.',
      rating: 5,
      initial: '이',
      isVerified: true,
      isPublished: true,
      order: 3,
    },
    {
      name: '정수연',
      role: '보험설계사',
      company: '메리츠화재',
      quote:
        '처음에는 복잡할 줄 알았는데, 사용해보니 정말 직관적이고 편리합니다.',
      rating: 4,
      initial: '정',
      isVerified: true,
      isPublished: true,
      order: 4,
    },
  ]);

  // FAQ 데이터 (실제 서비스에 맞는 내용)
  console.log('❓ FAQ 데이터 생성 중...');

  // 기존 FAQ 데이터 삭제 후 새로 삽입 (upsert 방식)
  await db.delete(faqs);

  await db.insert(faqs).values([
    // 일반 (general) 카테고리
    {
      question: 'SureCRM은 무료로 사용할 수 있나요?',
      answer:
        '초대를 통해 가입한 사용자는 베타 기간 동안 모든 기능을 무료로 이용할 수 있습니다. 정식 출시 후에는 기본 기능은 계속 무료로 제공되며, 고급 기능은 유료 플랜으로 제공될 예정입니다.',
      category: 'general',
      order: 1,
      isPublished: true,
    },
    {
      question: '어떻게 초대를 받을 수 있나요?',
      answer:
        '현재 SureCRM은 초대 전용 베타 서비스입니다. 이미 사용 중인 보험설계사로부터 초대를 받아 사용하실 수 있습니다.',
      category: 'general',
      order: 2,
      isPublished: true,
    },
    // {
    //   question: '모바일에서도 사용할 수 있나요?',
    //   answer:
    //     '네, SureCRM은 반응형 웹 디자인으로 제작되어 모바일, 태블릿에서도 최적화된 환경으로 이용하실 수 있습니다.',
    //   category: 'general',
    //   order: 3,
    //   isPublished: true,
    // },

    // 데이터 (data) 카테고리
    {
      question: '기존 고객 데이터를 가져올 수 있나요?',
      answer:
        '네, CSV, 엑셀 파일에서 고객 데이터를 쉽게 가져올 수 있습니다. 가져온 후에는 소개 관계를 설정하는 직관적인 인터페이스를 제공합니다.',
      category: 'data',
      order: 1,
      isPublished: true,
    },
    {
      question: '데이터는 안전하게 보관되나요?',
      answer:
        '고객의 개인정보 보호는 최우선 과제입니다. 모든 데이터는 암호화되어 저장되며, 해당 사용자만 접근할 수 있습니다. 개인정보 취급방침에 따라 엄격하게 관리됩니다.',
      category: 'data',
      order: 2,
      isPublished: true,
    },
    // {
    //   question: '고객 데이터 내보내기가 가능한가요?',
    //   answer:
    //     '네, 언제든지 CSV 형태로 고객 데이터를 내보낼 수 있습니다. 데이터 이동의 자유를 보장합니다.',
    //   category: 'data',
    //   order: 3,
    //   isPublished: true,
    // },

    // 팀 (team) 카테고리
    {
      question: '팀원들과 함께 사용할 수 있나요?',
      answer:
        '네, 팀 기능을 통해 여러 설계사가 함께 사용할 수 있습니다. 팀원 초대, 권한 관리, 팀 대시보드 등을 제공하여 협업을 지원합니다.',
      category: 'team',
      order: 1,
      isPublished: true,
    },
    {
      question: '팀원 수에 제한이 있나요?',
      answer:
        '베타 기간 중에는 팀원 수에 제한이 없습니다. 정식 출시 후에는 플랜에 따라 차이가 있을 예정입니다.',
      category: 'team',
      order: 2,
      isPublished: true,
    },

    // 기능 (features) 카테고리
    {
      question: '소개 네트워크 시각화는 어떻게 작동하나요?',
      answer:
        '고객 간의 소개 관계를 마인드맵 스타일의 그래프로 표현합니다. 누가 누구를 소개했는지 한눈에 파악할 수 있고, 핵심 소개자를 쉽게 발견할 수 있습니다.',
      category: 'features',
      order: 1,
      isPublished: true,
    },
    {
      question: '영업 파이프라인은 어떻게 관리하나요?',
      answer:
        '칸반보드 방식으로 고객을 영업 단계별로 분류하여 관리할 수 있습니다. 신규 리드부터 계약 완료까지 체계적으로 추적할 수 있습니다.',
      category: 'features',
      order: 2,
      isPublished: true,
    },

    // 지원 (support) 카테고리
    // {
    //   question: '기술 지원은 어떻게 받을 수 있나요?',
    //   answer:
    //     '이메일(support@surecrm.co.kr)로 문의하시면 24시간 내에 답변드립니다. 긴급한 경우 실시간 채팅도 지원합니다.',
    //   category: 'support',
    //   order: 1,
    //   isPublished: true,
    // },
    // {
    //   question: '사용법을 배울 수 있는 자료가 있나요?',
    //   answer:
    //     '가입 후 온보딩 가이드와 함께 도움말 센터에서 상세한 사용법을 확인하실 수 있습니다. 또한 정기적으로 웨비나도 진행합니다.',
    //   category: 'support',
    //   order: 2,
    //   isPublished: true,
    // },
  ]);

  // 공개 콘텐츠 (이용약관, 개인정보처리방침)
  console.log('�� 공개 콘텐츠 생성 중...');

  // 기존 공개 콘텐츠 삭제 후 새로 삽입 (upsert 방식)
  await db.delete(publicContents);

  await db.insert(publicContents).values([
    {
      type: 'terms_of_service',
      title: '이용약관',
      content: `# SureCRM 이용약관

## 제1조 (목적)
본 약관은 SureCRM(이하 "회사")이 제공하는 보험설계사 고객관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

## 제2조 (정의)
1. "서비스"란 회사가 제공하는 고객관리, 소개 네트워크, 팀 협업 등의 기능을 포함한 모든 서비스를 의미합니다.
2. "이용자"란 본 약관에 따라 회사와 이용계약을 체결하고 서비스를 이용하는 개인 또는 법인을 의미합니다.

## 제3조 (약관의 효력 및 변경)
1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
2. 회사는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력이 발생합니다.

*본 약관은 2024년 12월 19일부터 시행됩니다.*`,
      version: '1.0',
      status: 'published',
      effectiveDate: new Date('2024-12-19'),
    },
    {
      type: 'privacy_policy',
      title: '개인정보처리방침',
      content: `# 개인정보처리방침

## 1. 개인정보의 처리목적
SureCRM(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다.

### 가. 서비스 제공
- 고객관리 서비스 제공
- 소개 네트워크 기능 제공
- 팀 협업 기능 제공

### 나. 회원관리
- 회원 가입의사 확인
- 개인 식별
- 불량회원의 부정이용 방지

## 2. 개인정보의 처리 및 보유기간
회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

## 3. 정보주체의 권리·의무 및 행사방법
이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
- 개인정보 열람요구
- 오류 등이 있을 경우 정정·삭제요구
- 처리정지요구

*본 방침은 2024년 12월 19일부터 시행됩니다.*`,
      version: '1.0',
      status: 'published',
      effectiveDate: new Date('2024-12-19'),
    },
  ]);

  console.log('✅ 공개 페이지 데이터 생성 완료');
}

async function seedApplicationData() {
  console.log('🏢 메인 애플리케이션 데이터 생성 중...');

  try {
    // 1. 테스트 사용자 프로필 생성 (실제 Supabase Auth 사용자)
    console.log('👤 실제 사용자 프로필 생성 중...');

    // profiles 테이블에 실제 사용자 프로필 생성 (실제 auth.users에 있는 사용자만)
    await db.execute(sql`
      INSERT INTO profiles (id, full_name, phone, company, role, invitations_left, is_active, created_at, updated_at)
      VALUES 
        ('80b0993a-4194-4165-be5a-aec24b88cd80', 'Noah (Admin)', '010-1234-5678', 'SureCRM', 'agent', 2, true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // 2. 팀 데이터 생성
    console.log('📊 팀 데이터 생성 중...');
    const teamData = {
      name: 'SureCRM 개발팀',
      description: '보험설계사를 위한 고객관리 솔루션 개발팀',
      adminId: '80b0993a-4194-4165-be5a-aec24b88cd80', // 실제 사용자 ID
      settings: {
        allowInvitations: true,
        maxTeamSize: 50,
        features: ['clients', 'pipeline', 'calendar', 'reports'],
      },
    };

    const [team] = await db.insert(teams).values(teamData).returning();

    // 2. 파이프라인 스테이지 생성
    console.log('🔄 파이프라인 스테이지 생성 중...');
    const stagesData = [
      { name: '신규 리드', order: 1, color: '#3B82F6', teamId: team.id },
      { name: '상담 예정', order: 2, color: '#F59E0B', teamId: team.id },
      { name: '제안서 발송', order: 3, color: '#8B5CF6', teamId: team.id },
      { name: '계약 검토', order: 4, color: '#EF4444', teamId: team.id },
      { name: '계약 완료', order: 5, color: '#10B981', teamId: team.id },
    ];

    const stages = await db
      .insert(pipelineStages)
      .values(stagesData)
      .returning();

    // 3. 클라이언트 태그 생성
    console.log('🏷️ 클라이언트 태그 생성 중...');
    const tagsData = [
      {
        name: 'VIP',
        color: '#EF4444',
        agentId: '80b0993a-4194-4165-be5a-aec24b88cd80',
      },
      {
        name: '신혼부부',
        color: '#F59E0B',
        agentId: '80b0993a-4194-4165-be5a-aec24b88cd80',
      },
      {
        name: '고액자산가',
        color: '#8B5CF6',
        agentId: '80b0993a-4194-4165-be5a-aec24b88cd80',
      },
      {
        name: '재계약',
        color: '#10B981',
        agentId: '80b0993a-4194-4165-be5a-aec24b88cd80',
      },
      {
        name: '추천고객',
        color: '#3B82F6',
        agentId: '80b0993a-4194-4165-be5a-aec24b88cd80',
      },
    ];

    const tags = await db.insert(clientTags).values(tagsData).returning();

    // 4. 클라이언트 데이터 생성
    console.log('👥 클라이언트 데이터 생성 중...');
    const clientsData = [
      {
        agentId: '80b0993a-4194-4165-be5a-aec24b88cd80',
        teamId: team.id,
        fullName: '홍길동',
        email: 'hong@example.com',
        phone: '010-1111-2222',
        telecomProvider: 'SKT',
        address: '서울시 강남구',
        occupation: '회사원',
        hasDrivingLicense: true,
        height: 175,
        weight: 70,
        tags: ['VIP', '신혼부부'],
        importance: 'high' as const,
        currentStageId: stages[0].id,
        notes: '적극적인 상담 의지를 보임',
      },
      {
        agentId: '80b0993a-4194-4165-be5a-aec24b88cd80',
        teamId: team.id,
        fullName: '김철수',
        email: 'kim@example.com',
        phone: '010-2222-3333',
        telecomProvider: 'KT',
        address: '서울시 서초구',
        occupation: '자영업',
        hasDrivingLicense: true,
        height: 180,
        weight: 75,
        tags: ['고액자산가'],
        importance: 'high' as const,
        currentStageId: stages[1].id,
        notes: '보험료 예산 충분함',
      },
      {
        agentId: '80b0993a-4194-4165-be5a-aec24b88cd80',
        teamId: team.id,
        fullName: '이영희',
        email: 'lee@example.com',
        phone: '010-3333-4444',
        telecomProvider: 'LG U+',
        address: '서울시 송파구',
        occupation: '공무원',
        hasDrivingLicense: false,
        height: 165,
        weight: 55,
        tags: ['재계약'],
        importance: 'medium' as const,
        currentStageId: stages[2].id,
        notes: '기존 고객, 추가 상품 관심',
      },
      {
        agentId: '80b0993a-4194-4165-be5a-aec24b88cd80',
        teamId: team.id,
        fullName: '박민수',
        email: 'park@example.com',
        phone: '010-4444-5555',
        telecomProvider: 'SKT',
        address: '경기도 성남시',
        occupation: '의사',
        hasDrivingLicense: true,
        height: 178,
        weight: 72,
        tags: ['VIP', '추천고객'],
        importance: 'high' as const,
        currentStageId: stages[3].id,
        notes: '홍길동님 추천으로 방문',
      },
    ];

    const insertedClients = await db
      .insert(clients)
      .values(clientsData)
      .returning();

    // 추천 관계 설정
    await db
      .update(clients)
      .set({ referredById: insertedClients[0].id })
      .where(eq(clients.id, insertedClients[3].id));

    // 5. 클라이언트 상세 정보 생성
    console.log('📋 클라이언트 상세 정보 생성 중...');
    const clientDetailsData = insertedClients.map((client, index) => ({
      clientId: client.id,
      birthDate: new Date(1990 + index, index % 12, (index + 1) * 5)
        .toISOString()
        .split('T')[0],
      gender: index % 2 === 0 ? ('male' as const) : ('female' as const),
      consentDate: new Date(),
      consentDetails: {
        personalInfo: true,
        marketing: true,
        thirdParty: false,
      },
    }));

    await db.insert(clientDetails).values(clientDetailsData);

    // 6. 초대장 데이터 생성 (클럽하우스 모델 - 기본 2장)
    console.log('🎫 초대장 데이터 생성 중...');

    // createInitialInvitations 함수를 사용하여 자동 생성
    await createInitialInvitations('80b0993a-4194-4165-be5a-aec24b88cd80', 2);

    console.log('✅ 메인 애플리케이션 데이터 생성 완료');
    console.log(`📊 생성된 애플리케이션 데이터:
    - 팀: 1개
    - 파이프라인 스테이지: ${stagesData.length}개
    - 클라이언트: ${clientsData.length}개
    - 태그: ${tagsData.length}개
    - 클라이언트 상세정보: ${clientDetailsData.length}개
    - 초대장: 2개 (기본)`);

    console.log(`
⚠️  참고사항:
- 프로필 데이터는 Supabase Auth를 통해 생성되어야 합니다.
- 실제 사용 시에는 auth.users 테이블에 사용자가 먼저 생성되어야 합니다.
- 현재는 실제 사용자 ID를 사용하고 있습니다.
- 초대장 시스템: 가입 시 2장, 성공적인 초대 시 1장 추가 지급`);
  } catch (error) {
    console.error('❌ 메인 애플리케이션 데이터 생성 중 오류 발생:', error);
    throw error;
  }
}

export async function clearDatabase() {
  console.log('🗑️ 데이터베이스 초기화 중...');

  try {
    // 외래 키 제약 조건 때문에 순서대로 삭제

    // 1. 애플리케이션 데이터 삭제
    console.log('🏢 애플리케이션 데이터 삭제 중...');
    await db.delete(invitations);
    await db.delete(clientTags);
    await db.delete(clientDetails);
    await db.delete(clients);
    await db.delete(pipelineStages);
    await db.delete(teams);
    // profiles는 auth.users와 연결되어 있어서 직접 삭제하지 않음
    // 대신 SQL로 삭제
    await db.execute(
      sql`DELETE FROM profiles WHERE id::text LIKE '00000000-0000-0000-0000-%'`
    );

    console.log('✅ 데이터베이스 초기화 완료 (공개 페이지 데이터는 보존됨)');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류 발생:', error);
    throw error;
  }
}

export async function clearApplicationData() {
  console.log('🗑️ 애플리케이션 데이터만 삭제 중...');

  try {
    // 외래 키 제약 조건 때문에 순서대로 삭제
    await db.delete(invitations);
    await db.delete(clientTags);
    await db.delete(clientDetails);
    await db.delete(clients);
    await db.delete(pipelineStages);
    await db.delete(teams);
    // 테스트 profiles 삭제
    await db.execute(
      sql`DELETE FROM profiles WHERE id::text LIKE '00000000-0000-0000-0000-%'`
    );

    console.log('✅ 애플리케이션 데이터 삭제 완료');
  } catch (error) {
    console.error('❌ 애플리케이션 데이터 삭제 중 오류 발생:', error);
    throw error;
  }
}

export async function clearPublicData() {
  console.log('🗑️ 공개 페이지 데이터 삭제 중...');

  try {
    await db.delete(testimonials);
    await db.delete(faqs);
    await db.delete(publicContents);
    await db.delete(announcements);
    await db.delete(siteSettings);

    console.log('✅ 공개 페이지 데이터 삭제 완료');
  } catch (error) {
    console.error('❌ 공개 페이지 데이터 삭제 중 오류 발생:', error);
    throw error;
  }
}

export async function clearAllData() {
  console.log('🗑️ 모든 데이터 삭제 중...');

  try {
    // 1. 애플리케이션 데이터 삭제
    console.log('🏢 애플리케이션 데이터 삭제 중...');
    await clearApplicationData();

    // 2. 공개 페이지 데이터 삭제
    console.log('🌐 공개 페이지 데이터 삭제 중...');
    await clearPublicData();

    console.log('✅ 모든 데이터 삭제 완료');
  } catch (error) {
    console.error('❌ 모든 데이터 삭제 중 오류 발생:', error);
    throw error;
  }
}

// 개별 시드 함수들 (선택적 실행용)
export async function seedPublicOnly() {
  console.log('🌐 공개 페이지 데이터만 생성 중...');
  try {
    await seedPublicData();
    console.log('✅ 공개 페이지 데이터 생성 완료!');
  } catch (error) {
    console.error('❌ 공개 페이지 데이터 생성 실패:', error);
    throw error;
  }
}

export async function seedApplicationOnly() {
  console.log('🏢 애플리케이션 데이터만 생성 중...');
  try {
    await seedApplicationData();
    console.log('✅ 애플리케이션 데이터 생성 완료!');
  } catch (error) {
    console.error('❌ 애플리케이션 데이터 생성 실패:', error);
    throw error;
  }
}

// CLI 실행은 scripts/seed.js에서 처리
