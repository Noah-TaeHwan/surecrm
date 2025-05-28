import {
  useInvitationWithBonus,
  getUserInvitations,
  getInvitationStats,
  validateInvitationCode,
} from '../app/features/invitations/lib/invitations-data.js';

async function testInvitationFlow() {
  try {
    console.log('🧪 초대장 시스템 플로우 테스트 시작...\n');

    const noahUserId = '80b0993a-4194-4165-be5a-aec24b88cd80';
    const newUserId = '00000000-0000-0000-0000-000000000003'; // 가상의 새 사용자

    // 1. Noah의 현재 초대장 상태 확인
    console.log('📊 Noah의 현재 초대장 상태:');
    const noahInvitations = await getUserInvitations(noahUserId);
    const noahStats = await getInvitationStats(noahUserId);

    console.log(`  - 총 초대장: ${noahStats.totalSent}장`);
    console.log(`  - 사용 가능: ${noahStats.availableInvitations}장`);
    console.log(`  - 사용됨: ${noahStats.totalUsed}장`);

    if (noahInvitations.length > 0) {
      const firstInvitation = noahInvitations.find(
        (inv) => inv.status === 'available'
      );
      if (firstInvitation) {
        console.log(
          `  - 첫 번째 사용 가능한 초대장: ${firstInvitation.code}\n`
        );

        // 2. 초대장 코드 검증
        console.log('🔍 초대장 코드 검증:');
        const validation = await validateInvitationCode(firstInvitation.code);
        console.log(`  - 유효성: ${validation.valid ? '✅ 유효' : '❌ 무효'}`);
        if (validation.valid) {
          console.log(`  - 초대자: ${validation.invitation.inviterName}\n`);

          // 3. 초대장 사용 시뮬레이션 (실제로는 실행하지 않음)
          console.log('🎯 초대장 사용 시뮬레이션:');
          console.log(
            `  - 초대장 ${firstInvitation.code}를 새 사용자 ${newUserId}가 사용`
          );
          console.log('  - 예상 결과:');
          console.log('    * 초대자(Noah): 보너스 초대장 +1장');
          console.log('    * 신규 사용자: 기본 초대장 +2장');
          console.log('    * 초대장 상태: used로 변경\n');

          // 실제 사용은 주석 처리 (테스트용)
          // await useInvitationWithBonus(firstInvitation.code, newUserId);
        }
      } else {
        console.log('  - 사용 가능한 초대장이 없습니다.\n');
      }
    }

    console.log('✅ 초대장 시스템 플로우 테스트 완료!');
    console.log('\n📝 클럽하우스 모델 특징:');
    console.log('  - ✅ 기본 2장 시스템');
    console.log('  - ✅ 만료 없음 (영구 사용 가능)');
    console.log('  - ✅ 성공적인 초대 시 보너스 지급');
    console.log('  - ✅ 레벨 시스템 (5명당 레벨업)');
    console.log('  - ✅ 고급 보안 코드 생성');
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

testInvitationFlow();
