import { db } from '~/lib/core/db';
import { profiles, type Profile } from './schema';
import { eq } from 'drizzle-orm';

// 사용자 프로필 인터페이스
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
}

// 사용자 프로필 가져오기
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const profile = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        phone: profiles.phone,
        company: profiles.company,
        role: profiles.role,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!profile[0]) {
      return null;
    }

    const userProfile = profile[0];

    return {
      id: userProfile.id,
      name: userProfile.fullName || '사용자',
      email: '', // 이메일은 auth.users에서 가져와야 함
      phone: userProfile.phone || '',
      company: userProfile.company || 'SureCRM',
      position: getRoleDisplayName(userProfile.role),
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// 사용자 프로필 업데이트
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'phone' | 'company'>>
): Promise<boolean> {
  try {
    const updateData: any = {};

    if (updates.name !== undefined) {
      updateData.fullName = updates.name;
    }
    if (updates.phone !== undefined) {
      updateData.phone = updates.phone;
    }
    if (updates.company !== undefined) {
      updateData.company = updates.company;
    }

    if (Object.keys(updateData).length === 0) {
      return true; // 업데이트할 내용이 없음
    }

    updateData.updatedAt = new Date();

    await db.update(profiles).set(updateData).where(eq(profiles.id, userId));

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

// 역할 표시명 변환
function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'agent':
      return '보험설계사';
    case 'team_admin':
      return '팀 관리자';
    case 'system_admin':
      return '시스템 관리자';
    default:
      return '보험설계사';
  }
}

// 사용자 설정 가져오기
export async function getUserSettings(userId: string): Promise<any> {
  try {
    const profile = await db
      .select({
        settings: profiles.settings,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return profile[0]?.settings || {};
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return {};
  }
}

// 사용자 설정 업데이트
export async function updateUserSettings(
  userId: string,
  settings: any
): Promise<boolean> {
  try {
    await db
      .update(profiles)
      .set({
        settings,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
}
