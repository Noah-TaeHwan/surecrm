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
    process.env.REACT_APP_GIT_COMMIT || process.env.VITE_GIT_COMMIT;

  // Git tag가 있으면 우선 사용, 없으면 package.json 버전 사용
  const version = gitTag || baseVersion;

  return {
    version,
    gitTag,
    buildDate,
    environment,
    commitHash: commitHash?.substring(0, 7), // 짧은 커밋 해시
  };
}

/**
 * 현재 환경을 판단합니다
 */
function getEnvironment(): 'development' | 'production' | 'staging' {
  if (typeof window === 'undefined') {
    // 서버 사이드
    return process.env.NODE_ENV === 'production' ? 'production' : 'development';
  }

  // 클라이언트 사이드
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'development';
  }

  if (
    window.location.hostname.includes('staging') ||
    window.location.hostname.includes('vercel.app')
  ) {
    return 'staging';
  }

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
