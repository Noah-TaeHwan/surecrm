export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  team?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface NotificationSettings {
  // 알림 채널
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  kakaoNotifications: boolean;

  // 알림 타입
  meetingReminders: boolean;
  goalDeadlines: boolean;
  newReferrals: boolean;
  clientMilestones: boolean;
  teamUpdates: boolean;
  systemAlerts: boolean;
  birthdayReminders: boolean;
  followUpReminders: boolean;

  // 추가 설정
  quietHoursStart?: string;
  quietHoursEnd?: string;
  weekendNotifications: boolean;
}

export interface SystemSettings {
  language: string;
  darkMode: boolean;
}

export interface ProfileSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
}

export interface NotificationSectionProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => void;
}

export interface PasswordSectionProps {
  onChangePassword: (currentPassword: string, newPassword: string) => void;
}

export interface SystemSectionProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
}
