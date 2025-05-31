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

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
  recommendations: string[];
  completedFields: string[];
  isComplete: boolean;
}

export type InsuranceAgentRole =
  | 'agent' // 보험설계사
  | 'senior_agent' // 수석설계사
  | 'team_leader' // 팀장
  | 'branch_manager' // 지점장
  | 'regional_manager' // 본부장
  | 'team_admin' // 팀 관리자
  | 'system_admin'; // 시스템 관리자

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

export interface NotificationChannelStatus {
  channel: 'email' | 'sms' | 'push' | 'kakao';
  enabled: boolean;
  lastUsed?: Date;
  deliveryRate?: number; // 전달 성공률
}

export interface SystemSettings {
  language: string;
  darkMode: boolean;
  timezone?: string;
  dateFormat?: string;
  numberFormat?: string;
}

export interface InsuranceAgentSettings {
  // 업무 환경 설정
  workingHours: {
    start: string;
    end: string;
    workDays: number[]; // 0=일요일, 1=월요일, ...
  };

  // 고객 관리 설정
  clientManagement: {
    autoFollowUpDays: number;
    birthdayReminderDays: number;
    contractRenewalReminderDays: number;
  };

  // 성과 관리 설정
  performanceTracking: {
    monthlyGoalReminder: boolean;
    weeklyReportGeneration: boolean;
    achievementNotifications: boolean;
  };
}

export interface SettingsBackup {
  userId: string;
  settings: any;
  backupDate: string;
  version: string;
  description?: string;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedSettings?: any;
}

export interface ProfileSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
  completion?: ProfileCompletion;
  isLoading?: boolean;
}

export interface NotificationSectionProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => void;
  channelStatus?: NotificationChannelStatus[];
  isLoading?: boolean;
}

export interface PasswordSectionProps {
  onChangePassword: (currentPassword: string, newPassword: string) => void;
  isLoading?: boolean;
  lastChanged?: Date;
}

export interface SystemSectionProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
  agentSettings?: InsuranceAgentSettings;
  isLoading?: boolean;
}

export interface SettingsPageState {
  activeSection: 'profile' | 'notifications' | 'security' | 'system';
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  errors: Record<string, string>;
}

export interface SettingsChangeEvent {
  section: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  userId: string;
}

export interface SettingsSyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncErrors: string[];
}

export interface OnboardingSettings {
  profileCompleted: boolean;
  notificationsConfigured: boolean;
  teamJoined: boolean;
  firstGoalSet: boolean;
  tutorialCompleted: boolean;
  completionPercentage: number;
}

export interface SettingsExportData {
  version: string;
  exportDate: string;
  userId: string;
  profile: Partial<UserProfile>;
  notifications: NotificationSettings;
  system: SystemSettings;
  agentSettings?: InsuranceAgentSettings;
}

export interface SettingsMigration {
  fromVersion: string;
  toVersion: string;
  migrationDate: Date;
  changes: string[];
  success: boolean;
}

export type SettingsSection =
  | 'profile'
  | 'notifications'
  | 'security'
  | 'system';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'kakao';
export type SettingsTheme = 'light' | 'dark' | 'system';

export interface SettingsUpdateResult {
  success: boolean;
  message: string;
  updatedFields?: string[];
  errors?: Record<string, string>;
}

export const INSURANCE_AGENT_DEFAULTS = {
  profile: {
    company: 'SureCRM',
    position: '보험설계사',
  },
  notifications: {
    kakaoNotifications: true,
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
  system: {
    language: 'ko',
    darkMode: true,
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: 'ko-KR',
  },
  agentSettings: {
    workingHours: {
      start: '09:00',
      end: '18:00',
      workDays: [1, 2, 3, 4, 5], // 월-금
    },
    clientManagement: {
      autoFollowUpDays: 7,
      birthdayReminderDays: 3,
      contractRenewalReminderDays: 30,
    },
    performanceTracking: {
      monthlyGoalReminder: true,
      weeklyReportGeneration: true,
      achievementNotifications: true,
    },
  },
} as const;
