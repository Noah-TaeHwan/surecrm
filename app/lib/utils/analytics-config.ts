/**
 * 🔒 SureCRM 분석 시스템 환경 설정
 *
 * 개발 환경과 system_admin 사용자를 제외하여
 * 구글 애널리틱스/GTM 데이터 오염을 방지합니다.
 */

// 환경 변수 가져오기
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const GTM_CONTAINER_ID = import.meta.env.VITE_GTM_CONTAINER_ID;

/**
 * 개발 환경 감지
 */
export function isDevelopmentEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  // 🔧 개발 환경 조건들
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local');

  const isDevPort = [
    '5173',
    '5174',
    '5175',
    '5176',
    '5177',
    '5178',
    '5179',
    '5180',
    '5181',
    '5182',
    '5183',
    '5184',
    '5185',
    '5186',
    '5187',
    '3000',
    '8080',
  ].includes(window.location.port);

  // 🚀 Vercel 프로덕션 환경 명시적 제외
  const isVercelProduction =
    window.location.hostname.includes('.vercel.app') ||
    window.location.hostname.includes('surecrm-sigma.vercel.app');

  // Vercel 프로덕션이면 무조건 개발환경 아님
  if (isVercelProduction) {
    return false;
  }

  // 개발 환경 조건: localhost + dev port 조합
  return isLocalhost && (isDevPort || import.meta.env.DEV === true);
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
      console.debug(`🔍 사용자 역할 확인: ${role}`);
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
          console.debug(`🔍 세션에서 역할 확인: ${sessionRole}`);
          // 로컬 스토리지에도 저장
          localStorage.setItem('surecrm_user_role', sessionRole);
          return sessionRole;
        }
      }
    } catch (sessionError) {
      console.debug('세션 역할 확인 실패:', sessionError);
    }

    // 3차: 모든 방법 실패 시 null 반환
    console.debug('🔍 사용자 역할 없음 - 일반 사용자로 간주');
    return null;
  } catch (error) {
    console.debug('사용자 역할 확인 중 오류:', error);
    return null;
  }
}

/**
 * 분석 데이터 수집 허용 여부 확인
 */
export function shouldCollectAnalytics(): boolean {
  // 1. 필수 설정 확인 먼저
  if (!GA_MEASUREMENT_ID && !GTM_CONTAINER_ID) {
    console.log('⚠️ 분석 ID 미설정: 분석 데이터 수집 비활성화');
    return false;
  }

  // 2. system_admin 사용자 체크 (절대 우선순위)
  const userRole = getCurrentUserRole();
  if (isSystemAdminUser(userRole)) {
    console.log('👑 시스템 관리자: 분석 데이터 수집 비활성화 (환경 무관)');
    return false;
  }

  // 3. 환경별 정책
  if (isDevelopmentEnvironment()) {
    // 개발환경에서는 일반 사용자만 테스트용 추적
    console.log('🔧 개발환경: 일반 사용자 테스트 모드 활성화');
    return true;
  }

  // 4. 프로덕션 환경에서는 일반 사용자 추적 허용
  console.log('🚀 프로덕션: 일반 사용자 분석 데이터 수집 활성화');
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
  // 개발 환경에서는 중요한 정보만 (INFO 레벨)
  if (isDevelopmentEnvironment()) {
    return LOG_LEVELS.INFO;
  }

  // 프로덕션에서는 에러만 출력
  return LOG_LEVELS.ERROR;
};

// 로그 출력 빈도 제한을 위한 캐시
const logCache = new Map<string, number>();
const LOG_THROTTLE_MS = 30000; // 30초마다 같은 로그 허용

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

  // 같은 로그 반복 방지 (30초 throttle)
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

    // DEBUG 레벨에서만 차단 로그 출력
    if (level >= LOG_LEVELS.DEBUG) {
      console.log(`🚫 ${action} 건너뛰기: ${reason}`);
    }
    return;
  }

  // INFO 레벨에서만 성공 로그 출력
  if (level >= LOG_LEVELS.INFO) {
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
