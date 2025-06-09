import { db } from '~/lib/core/db';
import { profiles, invitations } from '~/lib/schema/core';
import { createInitialInvitations } from '~/features/invitations/lib/invitations-data';
import { eq, isNull } from 'drizzle-orm';

async function createMissingInvitations() {
  try {
    console.log('🔍 초대장이 없는 사용자들 찾는 중...');

    // 초대장이 없는 사용자들 조회
    const usersWithoutInvitations = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
      })
      .from(profiles)
      .leftJoin(invitations, eq(profiles.id, invitations.inviterId))
      .where(isNull(invitations.inviterId));

    if (usersWithoutInvitations.length === 0) {
      console.log('✅ 모든 사용자가 이미 초대장을 보유하고 있습니다.');
      return;
    }

    console.log(
      `📋 초대장이 없는 사용자 ${usersWithoutInvitations.length}명 발견:`
    );

    for (const user of usersWithoutInvitations) {
      console.log(`   - ${user.fullName} (${user.id})`);
    }

    console.log('\n🎁 초대장 생성 시작...');

    // 각 사용자에게 2장의 초대장 생성
    for (const user of usersWithoutInvitations) {
      try {
        await createInitialInvitations(user.id, 2);
        console.log(`✅ ${user.fullName}에게 초대장 2장 생성 완료`);
      } catch (error) {
        console.error(`❌ ${user.fullName} 초대장 생성 실패:`, error);
      }
    }

    console.log('\n🎉 초대장 생성 작업 완료!');
  } catch (error) {
    console.error('❌ 초대장 생성 스크립트 실행 실패:', error);
  }
}

// 스크립트 실행
createMissingInvitations()
  .then(() => {
    console.log('스크립트 종료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('스크립트 실행 중 오류:', error);
    process.exit(1);
  });
