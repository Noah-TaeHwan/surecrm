import { db } from '~/lib/core/db.server';
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
  lastLoginAt?: string; // 마지막 로그인 시간
  createdAt?: string;
  team?: {
    id: string;
    name: string;
    description?: string;
  };
}

// 보험설계사 특화 기본값
const INSURANCE_AGENT_DEFAULTS = {
  company: 'SureCRM',
  position: 'insurance_agent',
  settings: {
    language: 'ko',
    darkMode: true,
    notifications: {
      kakaoNotifications: true, // 보험설계사에게 가장 중요
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      meetingReminders: true,
      goalDeadlines: true,
      newReferrals: true,
      clientMilestones: true,
      followUpReminders: true,
      birthdayReminders: false,
      teamUpdates: true,
      systemAlerts: true,
      weekendNotifications: false,
    },
  },
};

// 프로필 완성도 계산
export function calculateProfileCompletion(profile: UserProfile): {
  percentage: number;
  missingFields: string[];
  recommendations: string[];
} {
  const requiredFields = [
    { key: 'name', label: '이름' },
    { key: 'email', label: '이메일' },
    { key: 'phone', label: '전화번호' },
    { key: 'company', label: '소속 보험사' },
  ];

  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    const value = profile[field.key as keyof UserProfile];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field.label);
    }
  });

  const percentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100
  );

  const recommendations: string[] = [];
  if (missingFields.length > 0) {
    recommendations.push(
      `${missingFields.join(
        ', '
      )}을(를) 입력하면 더 나은 서비스를 받을 수 있습니다.`
    );
  }
  if (!profile.team) {
    recommendations.push(
      '소속 팀을 설정하면 팀 협업 기능을 사용할 수 있습니다.'
    );
  }

  return { percentage, missingFields, recommendations };
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
        settings: profiles.settings,
        lastLoginAt: profiles.lastLoginAt,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!profile[0]) {
      // 프로필이 없으면 기본 프로필 생성
      await createDefaultProfile(userId);
      return {
        id: userId,
        name: '',
        email: '',
        phone: '',
        company: INSURANCE_AGENT_DEFAULTS.company,
        position: INSURANCE_AGENT_DEFAULTS.position,
        createdAt: new Date().toISOString(),
      };
    }

    const userProfile = profile[0];

    return {
      id: userProfile.id,
      name: userProfile.fullName || '',
      email: '', // 이메일은 auth.users에서 가져와야 함
      phone: userProfile.phone || '',
      company: userProfile.company || INSURANCE_AGENT_DEFAULTS.company,
      position: getRoleKeyFromDBRole(userProfile.role),
      lastLoginAt: userProfile.lastLoginAt?.toString(),
      createdAt: userProfile.createdAt?.toString() || new Date().toISOString(),
      // TODO: 팀 정보는 추후 구현
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// 기본 프로필 생성
async function createDefaultProfile(userId: string): Promise<void> {
  try {
    await db.insert(profiles).values({
      id: userId,
      fullName: '',
      company: INSURANCE_AGENT_DEFAULTS.company,
      role: 'agent',
      settings: INSURANCE_AGENT_DEFAULTS.settings,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating default profile:', error);
  }
}

// 사용자 프로필 업데이트
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'phone' | 'company' | 'position'>>
): Promise<boolean> {
  try {
    // 입력 검증
    if (updates.name && updates.name.trim().length < 2) {
      throw new Error('이름은 2자 이상이어야 합니다.');
    }

    if (
      updates.phone &&
      updates.phone.trim() &&
      !isValidInternationalPhoneNumber(updates.phone)
    ) {
      throw new Error('올바른 전화번호 형식이 아닙니다.');
    }

    const updateData: any = {};

    if (updates.name !== undefined) {
      updateData.fullName = updates.name.trim();
    }
    if (updates.phone !== undefined) {
      updateData.phone = updates.phone.trim();
    }
    if (updates.company !== undefined) {
      updateData.company =
        updates.company.trim() || INSURANCE_AGENT_DEFAULTS.company;
    }
    if (updates.position !== undefined) {
      // position을 role로 변환
      updateData.role = getRoleFromDisplayName(updates.position);
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

// 전화번호 유효성 검사 (한국 전화번호)
function isValidPhoneNumber(phone: string): boolean {
  // 한국 전화번호 패턴 (010-1234-5678, 01012345678 등)
  const phoneRegex = /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// 국제 전화번호 유효성 검사
function isValidInternationalPhoneNumber(phone: string): boolean {
  // 국제 전화번호 패턴 (+82-10-1234-5678, +1-555-123-4567 등)
  const internationalPhoneRegex =
    /^(\+\d{1,3}[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
  const cleanPhone = phone.replace(/\s/g, '');

  // 최소 길이 체크 (국가코드 포함 최소 8자리)
  if (cleanPhone.length < 8) {
    return false;
  }

  // 국제 형식이거나 한국 전화번호 형식이면 유효
  return internationalPhoneRegex.test(cleanPhone) || isValidPhoneNumber(phone);
}

// 역할 표시명 변환 (Supabase enum에 맞춤)
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

// DB 역할을 UI 키로 변환 (Supabase enum에 맞춤)
function getRoleKeyFromDBRole(role: string): string {
  switch (role) {
    case 'agent':
      return 'insurance_agent';
    case 'team_admin':
      return 'team_leader'; // team_admin을 팀장으로 표시
    case 'system_admin':
      return 'director'; // system_admin을 이사로 표시
    default:
      return 'insurance_agent';
  }
}

// 키를 역할로 변환 (Supabase enum 값에 맞춤)
function getRoleFromDisplayName(key: string): string {
  switch (key) {
    case 'insurance_agent':
      return 'agent';
    case 'sales_manager':
      return 'agent'; // senior_agent가 없으므로 agent로 매핑
    case 'team_leader':
      return 'team_admin'; // team_leader가 없으므로 team_admin으로 매핑
    case 'branch_manager':
      return 'team_admin'; // branch_manager가 없으므로 team_admin으로 매핑
    case 'regional_manager':
      return 'team_admin'; // regional_manager가 없으므로 team_admin으로 매핑
    case 'director':
      return 'team_admin';
    case 'consultant':
      return 'agent';
    case 'agent':
      return 'agent';
    case 'other':
      return 'agent';
    // 기존 번역된 값들도 지원 (하위 호환성)
    case '보험설계사':
    case 'Insurance Agent':
    case '保険設計士':
      return 'agent';
    case '수석설계사':
    case 'Senior Agent':
    case 'シニアエージェント':
    case '영업관리자':
      return 'agent'; // Supabase enum에 맞춤
    case '팀장':
    case 'Team Leader':
    case 'チームリーダー':
      return 'team_admin'; // Supabase enum에 맞춤
    case '지점장':
    case 'Branch Manager':
    case '支店長':
      return 'team_admin'; // Supabase enum에 맞춤
    case '본부장':
    case 'Regional Manager':
    case '地域マネージャー':
    case '지역관리자':
      return 'team_admin'; // Supabase enum에 맞춤
    case '팀 관리자':
    case 'Team Admin':
    case 'チーム管理者':
    case '이사':
      return 'team_admin';
    case '시스템 관리자':
    case 'System Admin':
    case 'システム管理者':
      return 'system_admin';
    case '컨설턴트':
    case '상담원':
    case '기타':
      return 'agent';
    default:
      return 'agent'; // 기본값
  }
}

// 사용자 설정 가져오기 (보험설계사 특화 기본값 적용)
export async function getUserSettings(userId: string): Promise<any> {
  try {
    const profile = await db
      .select({
        settings: profiles.settings,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    const userSettings = profile[0]?.settings || {};

    // 보험설계사 특화 기본값과 병합
    return {
      ...INSURANCE_AGENT_DEFAULTS.settings,
      ...userSettings,
    };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return INSURANCE_AGENT_DEFAULTS.settings;
  }
}

// 사용자 설정 업데이트 (검증 로직 포함)
export async function updateUserSettings(
  userId: string,
  settings: any
): Promise<boolean> {
  try {
    // 설정 검증
    const validatedSettings = validateUserSettings(settings);

    await db
      .update(profiles)
      .set({
        settings: validatedSettings,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
}

// 설정 검증 함수
function validateUserSettings(settings: any): any {
  const validatedSettings = { ...settings };

  // 언어 설정 검증
  if (!['ko'].includes(validatedSettings.language)) {
    validatedSettings.language = 'ko';
  }

  // 다크모드 설정 검증
  if (typeof validatedSettings.darkMode !== 'boolean') {
    validatedSettings.darkMode = true;
  }

  // 알림 설정 검증
  if (validatedSettings.notifications) {
    const notifications = validatedSettings.notifications;
    const defaultNotifications =
      INSURANCE_AGENT_DEFAULTS.settings.notifications;

    // 카카오톡 알림은 보험설계사에게 중요하므로 기본 활성화
    if (typeof notifications.kakaoNotifications !== 'boolean') {
      notifications.kakaoNotifications = true;
    }

    // 기타 알림 설정 검증
    const notificationKeys = [
      'emailNotifications',
      'pushNotifications',
      'smsNotifications',
      'meetingReminders',
      'goalDeadlines',
      'newReferrals',
      'clientMilestones',
      'followUpReminders',
      'birthdayReminders',
      'teamUpdates',
      'systemAlerts',
      'weekendNotifications',
    ];

    notificationKeys.forEach(key => {
      if (typeof notifications[key] !== 'boolean') {
        notifications[key] =
          defaultNotifications[key as keyof typeof defaultNotifications];
      }
    });
  }

  return validatedSettings;
}

// 설정 초기화 (보험설계사 특화 기본값으로)
export async function resetUserSettings(userId: string): Promise<boolean> {
  try {
    await db
      .update(profiles)
      .set({
        settings: INSURANCE_AGENT_DEFAULTS.settings,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    return true;
  } catch (error) {
    console.error('Error resetting user settings:', error);
    return false;
  }
}

// 설정 백업 생성
export async function backupUserSettings(userId: string): Promise<any | null> {
  try {
    const settings = await getUserSettings(userId);
    return {
      userId,
      settings,
      backupDate: new Date().toISOString(),
      version: 'MVP_v1.0',
    };
  } catch (error) {
    console.error('Error backing up user settings:', error);
    return null;
  }
}
