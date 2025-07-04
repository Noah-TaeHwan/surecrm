#!/usr/bin/env tsx

/**
 * 🔧 Git Hooks 설정 스크립트
 * 새로운 개발자가 프로젝트를 클론했을 때 자동으로 Git hooks를 설정합니다.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, chmodSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const GIT_HOOKS_DIR = join(PROJECT_ROOT, '.git', 'hooks');

console.log('🔧 Setting up Git hooks for automatic version bumping...');

try {
  // .git/hooks 디렉토리 확인 및 생성
  mkdirSync(GIT_HOOKS_DIR, { recursive: true });

  // pre-push 훅 스크립트 생성
  const prePushHook = `#!/bin/sh
# 자동 버전 증가 pre-push 훅

echo "🏷️  Auto bumping version before push..."

# 현재 브랜치 확인
current_branch=$(git rev-parse --abbrev-ref HEAD)

# master/main 브랜치가 아니면 스킵
if [ "$current_branch" != "master" ] && [ "$current_branch" != "main" ]; then
    echo "ℹ️  Skipping version bump (not on master/main branch)"
    exit 0
fi

# 변경사항이 있는지 확인
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Working directory not clean. Committing changes first..."
    git add .
    git commit -m "🚀 Auto commit before version bump"
fi

# 패치 버전 증가
npm version patch --no-git-tag-version

# package.json 변경사항 커밋
git add package.json
git commit -m "🏷️ Auto bump version to $(node -p "require('./package.json').version")"

# 태그 생성
new_version="v$(node -p "require('./package.json').version")"
git tag "$new_version"

echo "✅ Version bumped to $new_version"
`;

  const prePushPath = join(GIT_HOOKS_DIR, 'pre-push');
  writeFileSync(prePushPath, prePushHook);
  chmodSync(prePushPath, 0o755);

  console.log('✅ pre-push hook created successfully');

  // 간단한 버전 정보 확인 스크립트도 생성
  const versionInfoScript = `#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
);

console.log(\`📦 Current version: v\${packageJson.version}\`);
console.log(\`🚀 Next push will bump to: v\${packageJson.version.split('.').map((v, i) => i === 2 ? String(Number(v) + 1) : v).join('.')}\`);
`;

  writeFileSync(
    join(PROJECT_ROOT, 'scripts', 'utils', 'version-info.ts'),
    versionInfoScript
  );

  console.log('✅ Git hooks setup completed!');
  console.log('');
  console.log('📋 How to use:');
  console.log('  - Just push normally: git push origin master');
  console.log('  - Version will automatically increment from v0.7.4 → v0.7.5');
  console.log('  - Check current version: npm run version:info');
  console.log('');
} catch (error) {
  console.error('❌ Error setting up git hooks:', error);
  process.exit(1);
}
