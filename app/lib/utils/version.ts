/**
 * 🏷️ 버전 관리 유틸리티
 * Git Tag + Package.json 기반 자동 버전 관리 시스템
 */

import packageJson from '../../../package.json';

export interface VersionInfo {
  version: string;
  gitTag?: string;
  buildDate: string;
  environment: 'development' | 'production' | 'staging';
  commitHash?: string;
}

/**
 * 현재 애플리케이션 버전 정보를 가져옵니다
 */
export function getVersionInfo(): VersionInfo {
  const baseVersion = packageJson.version;
  const buildDate = new Date().toISOString();
  const environment = getEnvironment();

  // 빌드 시 환경변수로 주입될 Git 정보
  const gitTag = process.env.REACT_APP_GIT_TAG || process.env.VITE_GIT_TAG;
  const commitHash =
    process.env.REACT_APP_GIT_COMMIT ||
    process.env.VITE_GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA; // Vercel 자동 환경변수

  // 🔧 항상 package.json 버전을 기준으로 사용하여 동기화
  const version = baseVersion;

  return {
    version,
    gitTag,
    buildDate,
    environment,
    commitHash: commitHash?.substring(0, 7), // 짧은 커밋 해시
  };
}

/**
 * 현재 환경을 판단합니다 (SSR 안전)
 */
function getEnvironment(): 'development' | 'production' | 'staging' {
  // 🔧 Vercel 환경변수 기반 판단 (가장 정확)
  if (process.env.VERCEL_ENV) {
    switch (process.env.VERCEL_ENV) {
      case 'development':
        return 'development';
      case 'preview':
        return 'staging';
      case 'production':
        return 'production';
    }
  }

  // 빌드 환경 기반 판단
  const buildEnv = process.env.NODE_ENV;

  // 서버사이드에서는 빌드 환경 사용
  if (typeof window === 'undefined') {
    return buildEnv === 'production' ? 'production' : 'development';
  }

  // 클라이언트사이드: 호스트명 기반 판단
  const hostname = window.location.hostname;

  // 로컬 개발 환경
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }

  // Vercel 배포 환경 (preview 브랜치)
  if (hostname.includes('vercel.app')) {
    return 'staging';
  }

  // 커스텀 도메인 (프로덕션)
  return 'production';
}

/**
 * 버전 표시용 포맷팅된 문자열을 반환합니다
 */
export function getFormattedVersion(): string {
  const info = getVersionInfo();

  if (info.environment === 'development') {
    return `v${info.version}-dev`;
  }

  if (info.commitHash && info.environment === 'staging') {
    return `v${info.version}-${info.commitHash}`;
  }

  return `v${info.version}`;
}

/**
 * 상세한 버전 정보 문자열을 반환합니다 (툴팁용)
 */
export function getDetailedVersionInfo(): string {
  const info = getVersionInfo();
  const parts = [`버전: ${info.version}`];

  if (info.gitTag && info.gitTag !== info.version) {
    parts.push(`Git Tag: ${info.gitTag}`);
  }

  if (info.commitHash) {
    parts.push(`커밋: ${info.commitHash}`);
  }

  parts.push(`환경: ${info.environment}`);
  parts.push(`빌드: ${new Date(info.buildDate).toLocaleDateString('ko-KR')}`);

  return parts.join('\n');
}
