#!/usr/bin/env tsx

/**
 * 🏷️ 버전 정보 조회 스크립트
 * 현재 프로젝트의 버전 정보를 터미널에서 확인할 수 있습니다.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

interface VersionInfo {
  packageVersion: string;
  gitTag?: string;
  gitCommit: string;
  gitBranch: string;
  buildDate: string;
  isDirty: boolean;
}

function getVersionInfo(): VersionInfo {
  // Package.json 버전 읽기
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf8')
  );
  const packageVersion = packageJson.version;

  // Git 정보 수집
  let gitTag = '';
  let gitCommit = '';
  let gitBranch = '';
  let isDirty = false;

  try {
    // 현재 브랜치
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
    }).trim();

    // 현재 커밋
    gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

    // 최근 Git tag
    try {
      gitTag = execSync('git describe --tags --abbrev=0', {
        encoding: 'utf8',
      }).trim();
    } catch {
      gitTag = '(태그 없음)';
    }

    // 작업 디렉토리가 더러운지 확인
    try {
      execSync('git diff --quiet', { encoding: 'utf8' });
      execSync('git diff --cached --quiet', { encoding: 'utf8' });
      isDirty = false;
    } catch {
      isDirty = true;
    }
  } catch (error) {
    console.error('⚠️  Git 정보를 가져올 수 없습니다:', error);
  }

  return {
    packageVersion,
    gitTag,
    gitCommit,
    gitBranch,
    buildDate: new Date().toISOString(),
    isDirty,
  };
}

function printVersionInfo() {
  const info = getVersionInfo();

  console.log('\n🏷️  SureCRM 버전 정보');
  console.log('═'.repeat(50));

  console.log(`📦 Package 버전:  ${info.packageVersion}`);
  console.log(`🏷️  Git Tag:       ${info.gitTag}`);
  console.log(`🌿 Git 브랜치:     ${info.gitBranch}`);
  console.log(`📝 Git 커밋:       ${info.gitCommit.substring(0, 7)}...`);
  console.log(
    `🕒 빌드 시간:      ${new Date(info.buildDate).toLocaleString('ko-KR')}`
  );
  console.log(
    `🔧 작업 상태:      ${info.isDirty ? '🔴 수정사항 있음' : '🟢 깨끗함'}`
  );

  console.log('\n💡 버전 관리 명령어:');
  console.log(
    '  npm run version:patch  # 패치 버전 업데이트 (v0.1.0 → v0.1.1)'
  );
  console.log(
    '  npm run version:minor  # 마이너 버전 업데이트 (v0.1.0 → v0.2.0)'
  );
  console.log(
    '  npm run version:major  # 메이저 버전 업데이트 (v0.1.0 → v1.0.0)'
  );
  console.log('  npm run version:info   # 현재 버전 정보 조회');

  console.log('\n🚀 배포 후 버전 확인:');
  console.log(
    '  사이드바 하단의 버전을 마우스 오버하면 상세 정보를 볼 수 있습니다.'
  );
  console.log('');
}

// 스크립트 실행
printVersionInfo();
