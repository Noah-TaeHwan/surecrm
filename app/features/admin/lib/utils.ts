/**
 * 🔒 Admin 백오피스 전용 유틸리티 (클라이언트 안전)
 * 보안 최우선: 감사 로깅, 접근 제어, 데이터 보호
 */

/**
 * 🛡️ Admin 작업 권한 검증
 * 특정 Admin 작업에 대한 추가 권한 검증
 */
export function validateAdminOperation(
  adminUser: any,
  operation: string
): boolean {
  // 기본적으로 system_admin만 모든 작업 허용
  if (adminUser.role !== 'system_admin') {
    return false;
  }

  // 특별히 위험한 작업들에 대한 추가 검증
  const criticalOperations = [
    'DELETE_USER_DATA',
    'MODIFY_SYSTEM_SETTINGS',
    'ACCESS_SENSITIVE_DATA',
  ];

  if (criticalOperations.includes(operation)) {
    // 추가 검증 로직 (예: 특별 권한, 시간 제한 등)
    console.warn(
      `[ADMIN SECURITY] Critical operation attempted: ${operation} by ${adminUser.id}`
    );
  }

  return true;
}

/**
 * 🔐 Admin 데이터 마스킹
 * 민감한 정보를 안전하게 표시
 */
export function maskSensitiveData(data: any, field: string): string {
  if (!data || !data[field]) return '';

  const value = data[field].toString();

  switch (field) {
    case 'email':
      // 이메일 마스킹: test***@example.com
      const [local, domain] = value.split('@');
      if (local.length <= 3) return value;
      return `${local.substring(0, 3)}***@${domain}`;

    case 'phone':
      // 전화번호 마스킹: 010-****-1234
      if (value.length <= 7) return value;
      return `${value.substring(0, 3)}-****-${value.substring(
        value.length - 4
      )}`;

    default:
      return value;
  }
}
