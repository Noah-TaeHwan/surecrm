import { getUserProfile } from '../data/user';

/**
 * 사용자 권한 확인
 */
export async function checkUserPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId);

    if (!profile) {
      return false;
    }

    // 시스템 관리자는 모든 권한
    if (profile.role === 'system_admin') {
      return true;
    }

    // 팀 관리자 권한
    if (profile.role === 'team_admin') {
      const teamPermissions = [
        'manage_team',
        'view_team_reports',
        'invite_members',
      ];
      return teamPermissions.includes(permission);
    }

    // 일반 사용자 권한
    const userPermissions = [
      'view_own_data',
      'manage_own_clients',
      'create_invitations',
    ];
    return userPermissions.includes(permission);
  } catch (error) {
    console.error('사용자 권한 확인 오류:', error);
    return false;
  }
}
