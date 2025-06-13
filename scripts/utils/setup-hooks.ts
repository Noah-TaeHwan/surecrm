#!/usr/bin/env tsx

/**
 * 🔧 Git Hooks 설정 스크립트
 * 새로운 개발자가 프로젝트를 클론했을 때 자동으로 Git hooks를 설정합니다.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

function setupGitHooks() {
  console.log('\n🔧 Git Hooks 설정 중...');
  console.log('═'.repeat(50));

  // .githooks 디렉토리 확인
  const hooksDir = join(process.cwd(), '.githooks');
  if (!existsSync(hooksDir)) {
    console.error('❌ .githooks 디렉토리를 찾을 수 없습니다.');
    process.exit(1);
  }

  try {
    // Git hooks 경로 설정
    execSync('git config core.hooksPath .githooks', { encoding: 'utf8' });
    console.log('✅ Git hooks 경로 설정 완료: .githooks');

    // hooks 파일들에 실행 권한 부여
    const hookFiles = ['.githooks/pre-push'];

    hookFiles.forEach(hookFile => {
      if (existsSync(hookFile)) {
        execSync(`chmod +x ${hookFile}`, { encoding: 'utf8' });
        console.log(`✅ 실행 권한 부여: ${hookFile}`);
      }
    });

    console.log('\n🎉 Git Hooks 설정 완료!');
    console.log('\n📋 설정된 Hooks:');
    console.log('  • pre-push: 자동 패치 버전 업데이트');

    console.log('\n💡 사용법:');
    console.log('  git push origin master  # 자동으로 0.1.0 → 0.1.1 증가');
    console.log('  npm run version:minor   # 수동으로 0.1.5 → 0.2.0 증가');
    console.log('  npm run version:major   # 수동으로 0.2.3 → 1.0.0 증가');
  } catch (error) {
    console.error('❌ Git Hooks 설정 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
setupGitHooks();
