import { db } from '~/lib/db';
import { meetings, clients, profiles } from '~/lib/supabase-schema';
import { meetingChecklists } from '../schema';
import { eq } from 'drizzle-orm';

/**
 * Calendar feature를 위한 시드 데이터 생성
 */
export async function seedCalendarData() {
  console.log('📅 Calendar 시드 데이터 생성 중...');

  try {
    // 기존 에이전트 확인 (시드 데이터에서 생성된 에이전트 사용)
    const existingAgents = await db
      .select({ id: profiles.id, fullName: profiles.fullName })
      .from(profiles)
      .limit(3);

    if (existingAgents.length === 0) {
      console.log(
        '⚠️ 에이전트가 없습니다. 먼저 기본 시드 데이터를 생성하세요.'
      );
      return;
    }

    const agent = existingAgents[0]; // 첫 번째 에이전트 사용
    console.log(`👤 에이전트 사용: ${agent.fullName} (${agent.id})`);

    // 해당 에이전트의 클라이언트 확인
    const existingClients = await db
      .select({ id: clients.id, fullName: clients.fullName })
      .from(clients)
      .where(eq(clients.agentId, agent.id))
      .limit(10);

    if (existingClients.length === 0) {
      console.log(
        '⚠️ 클라이언트가 없습니다. 먼저 클라이언트 시드 데이터를 생성하세요.'
      );
      return;
    }

    console.log(`👥 ${existingClients.length}명의 클라이언트 발견`);

    // 기존 미팅과 체크리스트 삭제 (해당 에이전트의 것만)
    await db.delete(meetings).where(eq(meetings.agentId, agent.id));

    // 미팅 시드 데이터 생성
    const today = new Date();
    const meetingsToCreate = [
      // 오늘 미팅들
      {
        agentId: agent.id,
        clientId: existingClients[0]?.id,
        title: `${existingClients[0]?.fullName}님 첫 상담`,
        description: '보험 필요성 상담 및 니즈 파악',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          14,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          15,
          0
        ),
        location: '고객 사무실',
        meetingType: 'first_consultation',
        status: 'scheduled',
      },
      {
        agentId: agent.id,
        clientId: existingClients[1]?.id,
        title: `${existingClients[1]?.fullName}님 상품 설명`,
        description: '종신보험 상품 설명 및 견적 제시',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          16,
          30
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          18,
          0
        ),
        location: '스타벅스 강남점',
        meetingType: 'product_explanation',
        status: 'scheduled',
      },
      // 내일 미팅
      {
        agentId: agent.id,
        clientId: existingClients[2]?.id,
        title: `${existingClients[2]?.fullName}님 계약 체결`,
        description: '가족보험 계약 체결 및 서류 작성',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
          15,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
          17,
          0
        ),
        location: '본사 상담실',
        meetingType: 'contract_review',
        status: 'scheduled',
      },
      // 모레 미팅들
      {
        agentId: agent.id,
        clientId: existingClients[3]?.id,
        title: `${existingClients[3]?.fullName}님 니즈 분석`,
        description: '가족 구성원별 보험 니즈 분석',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 2,
          10,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 2,
          11,
          0
        ),
        location: '고객 자택',
        meetingType: 'first_consultation',
        status: 'scheduled',
      },
      {
        agentId: agent.id,
        clientId: existingClients[4]?.id,
        title: `${existingClients[4]?.fullName}님 정기 점검`,
        description: '기존 보험 상품 점검 및 변경사항 논의',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 2,
          14,
          30
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 2,
          15,
          15
        ),
        location: '카페 온더테이블',
        meetingType: 'follow_up',
        status: 'scheduled',
      },
      // 다음 주 미팅들
      {
        agentId: agent.id,
        clientId: existingClients[5]?.id,
        title: `${existingClients[5]?.fullName}님 계약 검토`,
        description: '실손보험 약관 검토 및 최종 확인',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 3,
          11,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 3,
          12,
          15
        ),
        location: '본사 회의실',
        meetingType: 'contract_review',
        status: 'scheduled',
      },
      {
        agentId: agent.id,
        clientId: existingClients[6]?.id,
        title: `${existingClients[6]?.fullName}님 첫 상담`,
        description: '30대 직장인 보험 포트폴리오 상담',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 4,
          9,
          30
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 4,
          11,
          0
        ),
        location: '고객 직장',
        meetingType: 'first_consultation',
        status: 'scheduled',
      },
      {
        agentId: agent.id,
        clientId: existingClients[7]?.id,
        title: `${existingClients[7]?.fullName}님 상품 설명`,
        description: '자녀 교육보험 상품 설명',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 5,
          16,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 5,
          17,
          0
        ),
        location: '롯데백화점 카페',
        meetingType: 'product_explanation',
        status: 'scheduled',
      },
      // 다음 주 추가 미팅들
      {
        agentId: agent.id,
        clientId: existingClients[8]?.id,
        title: `${existingClients[8]?.fullName}님 계약 체결`,
        description: '종신보험 + 암보험 패키지 계약',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 7,
          13,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 7,
          14,
          40
        ),
        location: '본사 상담실',
        meetingType: 'contract_review',
        status: 'scheduled',
      },
      {
        agentId: agent.id,
        clientId: existingClients[9]?.id,
        title: `${existingClients[9]?.fullName}님 정기 점검`,
        description: '기업 단체보험 갱신 상담',
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 8,
          15,
          30
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 8,
          16,
          20
        ),
        location: '고객 사무실',
        meetingType: 'follow_up',
        status: 'scheduled',
      },
    ].filter((meeting) => meeting.clientId); // clientId가 있는 것만 필터링

    // 새 미팅 생성
    const createdMeetings = await db
      .insert(meetings)
      .values(meetingsToCreate as any)
      .returning();

    console.log(`✅ ${createdMeetings.length}개의 미팅 생성 완료`);

    // 각 미팅에 대해 체크리스트 생성
    let totalChecklists = 0;
    for (const meeting of createdMeetings) {
      const checklistItems = getDefaultChecklistByType(meeting.meetingType);

      if (checklistItems.length > 0) {
        const checklistsToCreate = checklistItems.map((item, index) => ({
          meetingId: meeting.id,
          text: item,
          completed: Math.random() > 0.7, // 30% 확률로 완료 상태
          order: index + 1,
        }));

        await db.insert(meetingChecklists).values(checklistsToCreate);
        totalChecklists += checklistsToCreate.length;
      }
    }

    console.log(`✅ ${totalChecklists}개의 체크리스트 항목 생성 완료`);

    // 생성된 미팅 요약 출력
    createdMeetings.forEach((meeting, index) => {
      const startTime = new Date(meeting.startTime);
      console.log(
        `   ${index + 1}. ${meeting.title} - ${startTime.toLocaleDateString(
          'ko-KR'
        )} ${startTime.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      );
    });

    return {
      agentId: agent.id,
      meetingsCount: createdMeetings.length,
      checklistsCount: totalChecklists,
      clientsCount: existingClients.length,
    };
  } catch (error) {
    console.error('❌ Calendar 시드 데이터 생성 실패:', error);
    throw error;
  }
}

/**
 * 미팅 유형별 기본 체크리스트 반환
 */
function getDefaultChecklistByType(meetingType: string): string[] {
  const checklistMap: Record<string, string[]> = {
    first_consultation: [
      '고객 정보 확인',
      '상담 자료 준비',
      '니즈 분석 시트 작성',
      '다음 미팅 일정 협의',
    ],
    product_explanation: [
      '상품 설명서 준비',
      '견적서 작성',
      '비교 상품 자료 준비',
      '고객 질문 사항 정리',
    ],
    contract_review: [
      '계약서 검토',
      '약관 설명',
      '서명 및 날인',
      '초회 보험료 수납',
    ],
    follow_up: [
      '기존 계약 현황 확인',
      '변경 사항 논의',
      '추가 상품 제안',
      '만족도 조사',
    ],
    other: ['미팅 목적 확인', '필요 자료 준비', '논의 사항 정리'],
  };

  return checklistMap[meetingType] || checklistMap.other;
}

/**
 * Calendar 시드 데이터 실행 (독립 실행용)
 */
export async function runCalendarSeed() {
  try {
    console.log('🚀 Calendar 시드 데이터 생성 시작...\n');

    const result = await seedCalendarData();

    console.log('\n🎉 Calendar 시드 데이터 생성 완료!');
    console.log(
      `📊 결과: ${result?.meetingsCount}개 미팅, ${result?.checklistsCount}개 체크리스트, ${result?.clientsCount}명 클라이언트`
    );
  } catch (error) {
    console.error('💥 Calendar 시드 실행 실패:', error);
    process.exit(1);
  }
}
