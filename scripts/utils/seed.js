import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

import {
  seedApplicationOnly,
  seedPublicOnly,
  clearDatabase,
  clearApplicationData,
  clearPublicData,
  clearAllData,
} from '../app/lib/seed.ts';

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'seed':
        console.log('🚀 전체 시드 데이터 생성 시작...\n');

        // 1. 공개 페이지 데이터 시드
        console.log('📄 공개 페이지 데이터 생성 중...');
        await seedPublicOnly();

        // 2. 애플리케이션 데이터 시드
        console.log('\n📊 애플리케이션 데이터 생성 중...');
        await seedApplicationOnly();

        console.log('\n🎉 전체 시드 데이터 생성 완료!');
        break;

      case 'public':
        console.log('🚀 공개 페이지 시드 데이터 생성 시작...\n');
        await seedPublicOnly();
        console.log('\n🎉 공개 페이지 시드 데이터 생성 완료!');
        break;

      case 'app':
        console.log('🚀 애플리케이션 시드 데이터 생성 시작...\n');
        await seedApplicationOnly();
        console.log('\n🎉 애플리케이션 시드 데이터 생성 완료!');
        break;

      case 'clear':
        console.log('🗑️ 애플리케이션 데이터 삭제 시작...\n');
        console.log('ℹ️  공개 페이지 데이터는 보존됩니다.');
        await clearDatabase();
        console.log('\n✅ 애플리케이션 데이터 삭제 완료!');
        break;

      case 'clear:app':
        console.log('🗑️ 애플리케이션 데이터만 삭제 시작...\n');
        await clearApplicationData();
        console.log('\n✅ 애플리케이션 데이터 삭제 완료!');
        break;

      case 'clear:public':
        console.log('🗑️ 공개 페이지 데이터 삭제 시작...\n');
        console.log('⚠️  주의: 랜딩페이지와 약관 데이터가 삭제됩니다!');
        await clearPublicData();
        console.log('\n✅ 공개 페이지 데이터 삭제 완료!');
        break;

      case 'clear:all':
        console.log('🗑️ 모든 데이터 삭제 시작...\n');
        console.log('⚠️  주의: 공개 페이지 데이터도 모두 삭제됩니다!');
        await clearAllData();
        console.log('\n✅ 모든 데이터 삭제 완료!');
        break;

      case 'reset':
        console.log('🔄 데이터베이스 리셋 시작...\n');

        // 1. 애플리케이션 데이터만 삭제 (공개 페이지 데이터 보존)
        console.log('🗑️ 애플리케이션 데이터 삭제 중...');
        await clearApplicationData();

        // 2. 새 애플리케이션 데이터 생성
        console.log('\n📊 애플리케이션 데이터 생성 중...');
        await seedApplicationOnly();

        console.log(
          '\n🎉 데이터베이스 리셋 완료! (공개 페이지 데이터는 보존됨)'
        );
        break;

      case 'reset:all':
        console.log('🔄 전체 데이터베이스 리셋 시작...\n');

        // 1. 모든 데이터 삭제
        console.log('🗑️ 모든 데이터 삭제 중...');
        await clearAllData();

        // 2. 새 데이터 생성
        console.log('\n📄 공개 페이지 데이터 생성 중...');
        await seedPublicOnly();

        console.log('\n📊 애플리케이션 데이터 생성 중...');
        await seedApplicationOnly();

        console.log('\n🎉 전체 데이터베이스 리셋 완료!');
        break;

      default:
        console.log('사용법:');
        console.log('');
        console.log('📊 시드 데이터 생성:');
        console.log('  npm run db:seed        # 전체 시드 데이터 생성');
        console.log('  npm run db:seed:public # 공개 페이지 데이터만 생성');
        console.log('  npm run db:seed:app    # 애플리케이션 데이터만 생성');
        console.log('');
        console.log('🗑️  데이터 삭제:');
        console.log(
          '  npm run db:clear       # 애플리케이션 데이터만 삭제 (공개 페이지 보존)'
        );
        console.log('  npm run db:clear:app   # 애플리케이션 데이터만 삭제');
        console.log('  npm run db:clear:public # 공개 페이지 데이터만 삭제 ⚠️');
        console.log('  npm run db:clear:all   # 모든 데이터 삭제 ⚠️');
        console.log('');
        console.log('🔄 리셋:');
        console.log(
          '  npm run db:reset       # 애플리케이션 데이터 리셋 (공개 페이지 보존)'
        );
        console.log('  npm run db:reset:all   # 전체 데이터베이스 리셋');
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 시드 실행 실패:', error);
    process.exit(1);
  }
}

main();
