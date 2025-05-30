import { seedCalendarData } from '../app/features/calendar/lib/seed-calendar.ts';

async function main() {
  try {
    console.log('🚀 Calendar 시드 데이터 생성 시작...\n');

    const result = await seedCalendarData();

    if (result) {
      console.log('\n🎉 Calendar 시드 데이터 생성 완료!');
      console.log(
        `📊 결과: ${result.meetingsCount}개 미팅, ${result.clientsCount}명 클라이언트`
      );
    } else {
      console.log(
        '\n⚠️ 시드 데이터 생성을 건너뛰었습니다. (에이전트 또는 클라이언트 없음)'
      );
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 Calendar 시드 실행 실패:', error);
    process.exit(1);
  }
}

main();
