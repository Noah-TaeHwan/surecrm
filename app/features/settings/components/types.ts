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
  meetingReminder: boolean;
  contractUpdate: boolean;
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
