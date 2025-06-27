#!/usr/bin/env tsx

/**
 * 사용하지 않는 import 정리 스크립트
 *
 * 사용법: npm run cleanup:imports
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const EXTENSIONS = ['.ts', '.tsx'];
const IGNORE_DIRS = ['node_modules', '.git', 'build', 'dist'];

function findTsFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !IGNORE_DIRS.includes(item)) {
        files.push(...findTsFiles(fullPath));
      } else if (stat.isFile() && EXTENSIONS.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`디렉토리 읽기 실패: ${dir}`);
  }

  return files;
}

function main() {
  console.log('🧹 사용하지 않는 import 정리 시작...');

  // TypeScript 파일 찾기
  const tsFiles = findTsFiles('./app');
  console.log(`📁 ${tsFiles.length}개의 TypeScript 파일 발견`);

  // ESLint 자동 수정 실행
  try {
    console.log('🔧 ESLint 자동 수정 실행 중...');
    execSync('npx eslint app --ext .ts,.tsx --fix --quiet', {
      stdio: 'inherit',
    });
    console.log('✅ ESLint 자동 수정 완료');
  } catch (error) {
    console.warn('⚠️ ESLint 자동 수정 중 일부 오류 발생');
  }

  // TypeScript 컴파일러로 사용하지 않는 import 체크
  try {
    console.log('🔍 TypeScript 컴파일러로 추가 검사 중...');
    execSync('npx tsc --noEmit --skipLibCheck', {
      stdio: 'inherit',
    });
    console.log('✅ TypeScript 컴파일 검사 완료');
  } catch (error) {
    console.warn('⚠️ TypeScript 컴파일 검사에서 일부 오류 발견');
  }

  console.log('🎉 Import 정리 완료!');
  console.log('\n📝 다음 단계:');
  console.log('1. git diff로 변경사항 확인');
  console.log('2. npm run dev로 앱이 정상 작동하는지 확인');
  console.log('3. 문제없으면 커밋');
}

// ES 모듈에서는 import.meta.main 사용
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
