/**
 * 🔒 SureCRM 분석 시스템 환경 설정
 *
 * 개발 환경과 system_admin 사용자를 제외하여
 * 구글 애널리틱스/GTM 데이터 오염을 방지합니다.
 */

// 환경 변수 가져오기 (프로덕션에서만 설정)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const GTM_CONTAINER_ID = import.meta.env.VITE_GTM_CONTAINER_ID;

/**
 * 프로덕션 도메인 확인 (surecrm.pro에서만 GA 활성화)
 */
export function isProductionDomain(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.location.hostname === 'surecrm.pro' ||
    window.location.hostname === 'www.surecrm.pro'
  );
}

/**
 * 개발 환경 감지 (surecrm.pro가 아닌 모든 환경)
 */
export function isDevelopmentEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  // surecrm.pro 도메인이 아니면 모두 개발 환경으로 간주
  return !isProductionDomain();
}

/**
 * system_admin 역할 확인
 */
export function isSystemAdminUser(userRole?: string | null): boolean {
  return userRole === 'system_admin';
}

/**
 * 현재 사용자 역할 가져오기 (로컬 스토리지에서)
 */
export function getCurrentUserRole(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1차: useUserRoleTracker에서 저장한 역할 정보 확인
    const role = localStorage.getItem('surecrm_user_role');
    if (role && role.trim() !== '') {
      return role;
    }

    // 2차: Supabase 세션에서 사용자 정보 확인
    try {
      const userSession = localStorage.getItem('supabase.auth.token');
      if (userSession) {
        const sessionData = JSON.parse(userSession);
        const userMetadata = sessionData?.user?.user_metadata;
        const sessionRole = userMetadata?.role;

        if (sessionRole) {
          // 로컬 스토리지에도 저장
          localStorage.setItem('surecrm_user_role', sessionRole);
          return sessionRole;
        }
      }
    } catch (_sessionError) {
      // 세션 파싱 에러 무시
    }

    // 3차: 모든 방법 실패 시 null 반환
    return null;
  } catch (_error) {
    return null;
  }
}

/**
 * 분석 데이터 수집 허용 여부 확인
 */
export function shouldCollectAnalytics(): boolean {
  // 1. 개발 환경에서는 완전 차단 (로컬 데이터 보호)
  if (isDevelopmentEnvironment()) {
    return false;
  }

  // 2. 필수 설정 확인
  if (!GA_MEASUREMENT_ID && !GTM_CONTAINER_ID) {
    return false;
  }

  // 3. system_admin 사용자 체크 (프로덕션에서만)
  const userRole = getCurrentUserRole();
  if (isSystemAdminUser(userRole)) {
    return false;
  }

  // 4. 프로덕션 환경에서 일반 사용자만 추적 허용
  return true;
}

/**
 * GA 설정 정보
 */
export const analyticsConfig = {
  GA_MEASUREMENT_ID,
  GTM_CONTAINER_ID,
  shouldCollect: shouldCollectAnalytics(),
  isDevelopment: isDevelopmentEnvironment(),
  isSystemAdmin: () => isSystemAdminUser(getCurrentUserRole()),
};

// 로그 레벨 설정
const LOG_LEVELS = {
  NONE: 0, // 로그 없음
  ERROR: 1, // 에러만
  WARN: 2, // 경고 이상
  INFO: 3, // 정보 이상
  DEBUG: 4, // 모든 로그
} as const;

// 현재 로그 레벨 (환경에 따라 자동 설정)
const getCurrentLogLevel = (): number => {
  // 개발 환경에서는 디버깅용으로만 제한적 로그
  if (isDevelopmentEnvironment()) {
    return LOG_LEVELS.WARN;
  }

  // 프로덕션에서는 로그 완전 차단 (은밀한 수집)
  return LOG_LEVELS.NONE;
};

// 로그 출력 빈도 제한을 위한 캐시
const logCache = new Map<string, number>();
const LOG_THROTTLE_MS = 60000; // ✅ 60초로 증가 (기존 30초에서)

/**
 * 스마트 로그 헬퍼 함수
 */
export function logAnalyticsStatus(
  action: string,
  level: number = LOG_LEVELS.INFO
): void {
  const currentLevel = getCurrentLogLevel();

  // 로그 레벨 확인
  if (level > currentLevel) return;

  // ✅ 개발 환경에서는 애널리틱스 로그 완전 차단
  if (isDevelopmentEnvironment()) {
    return; // 개발 환경에서는 아예 로그 출력하지 않음
  }

  // 같은 로그 반복 방지 (60초 throttle)
  const logKey = `${action}_${level}`;
  const now = Date.now();
  const lastLogged = logCache.get(logKey);

  if (lastLogged && now - lastLogged < LOG_THROTTLE_MS) {
    return; // 같은 로그가 너무 자주 호출되면 무시
  }

  logCache.set(logKey, now);

  if (!shouldCollectAnalytics()) {
    const reason = isDevelopmentEnvironment()
      ? '개발환경'
      : isSystemAdminUser(getCurrentUserRole())
        ? '시스템 관리자'
        : '설정 미완료';

    // ✅ 차단 로그도 더 제한적으로 출력
    if (level >= LOG_LEVELS.WARN && !isDevelopmentEnvironment()) {
      console.log(`🚫 ${action} 건너뛰기: ${reason}`);
    }
    return;
  }

  // ✅ 성공 로그도 더 제한적으로 출력
  if (level >= LOG_LEVELS.INFO && !isDevelopmentEnvironment()) {
    console.log(`✅ ${action} 실행`);
  }
}

/**
 * 로그 레벨별 헬퍼 함수들
 */
export const analytics_log = {
  error: (message: string) => {
    if (getCurrentLogLevel() >= LOG_LEVELS.ERROR) {
      console.error(`🔴 [Analytics Error] ${message}`);
    }
  },

  warn: (message: string) => {
    if (getCurrentLogLevel() >= LOG_LEVELS.WARN) {
      console.warn(`🟡 [Analytics Warning] ${message}`);
    }
  },

  info: (message: string) => {
    if (getCurrentLogLevel() >= LOG_LEVELS.INFO) {
      console.log(`ℹ️ [Analytics Info] ${message}`);
    }
  },

  debug: (message: string) => {
    if (getCurrentLogLevel() >= LOG_LEVELS.DEBUG) {
      console.log(`🐛 [Analytics Debug] ${message}`);
    }
  },
};
