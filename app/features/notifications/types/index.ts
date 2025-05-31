// 📝 Notifications 기능 타입 정의 중앙 관리
// 스키마에서 기본 타입들을 재export하고 추가 타입들을 정의

// 📌 기본 스키마 타입들 재export
export type {
  NotificationQueue,
  NotificationHistory,
  NotificationSettings,
  NotificationTemplate,
  NotificationRule,
  NotificationSubscription,
  NewNotificationQueue,
  NewNotificationHistory,
  NewNotificationSettings,
  NewNotificationTemplate,
  NewNotificationRule,
  NewNotificationSubscription,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationStatus,
  NotificationOverview,
  NotificationFilter,
  NotificationStats,
} from '../lib/schema';

// 추가 타입들 import
import type {
  NotificationQueue,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '../lib/schema';

// 📌 컴포넌트 Props 타입들
export interface NotificationCardProps {
  notification: NotificationQueue;
  showActions?: boolean;
  className?: string;
}

export interface NotificationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: NotificationStatus | 'all';
  onStatusFilterChange: (value: NotificationStatus | 'all') => void;
  typeFilter: NotificationType | 'all';
  onTypeFilterChange: (value: NotificationType | 'all') => void;
}

export interface NotificationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  totalCount: number;
  unreadCount: number;
}

export interface NotificationEmptyStateProps {
  type: 'no-notifications' | 'no-unread' | 'no-read' | 'no-search-results';
  searchQuery?: string;
  hasFilters?: boolean;
}

// 📌 페이지 및 API 관련 타입들
export interface NotificationPageData {
  notifications: NotificationQueue[];
  unreadCount: number;
  user: {
    id: string;
    email: string;
    fullName?: string;
  } | null;
}

export interface NotificationActionData {
  success?: boolean;
  error?: string;
}

export interface NotificationAPIResponse {
  notifications: NotificationQueue[];
  unreadCount: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 📌 필터링 및 검색 관련 타입들
export interface NotificationFilterState {
  searchQuery: string;
  statusFilter: NotificationStatus | 'all';
  typeFilter: NotificationType | 'all';
  activeTab: 'all' | 'unread' | 'read';
}

export interface NotificationQueryOptions {
  limit?: number;
  offset?: number;
  status?: NotificationStatus;
  type?: NotificationType;
  unreadOnly?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

// 📌 알림 생성 및 관리 관련 타입들
export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  title: string;
  message: string;
  recipient: string;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationData {
  title?: string;
  message?: string;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationBulkActions {
  markAllAsRead: () => Promise<void>;
  deleteMultiple: (ids: string[]) => Promise<void>;
  markMultipleAsRead: (ids: string[]) => Promise<void>;
}

// 📌 알림 설정 관련 타입들
export interface NotificationSettingsUpdate {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  kakaoNotifications?: boolean;
  meetingReminders?: boolean;
  goalDeadlines?: boolean;
  newReferrals?: boolean;
  clientMilestones?: boolean;
  teamUpdates?: boolean;
  systemAlerts?: boolean;
  birthdayReminders?: boolean;
  followUpReminders?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  weekendNotifications?: boolean;
}

// 📌 통계 및 분석 관련 타입들
export interface NotificationMetrics {
  totalNotifications: number;
  unreadNotifications: number;
  readRate: number;
  averageResponseTime: number;
  mostActiveChannel: NotificationChannel;
  mostFrequentType: NotificationType;
}

export interface NotificationTrend {
  date: string;
  count: number;
  readCount: number;
  unreadCount: number;
}

// 📌 Enum 값들을 배열로 제공 (UI에서 사용)
export const NOTIFICATION_TYPES: NotificationType[] = [
  'meeting_reminder',
  'goal_achievement',
  'goal_deadline',
  'new_referral',
  'client_milestone',
  'team_update',
  'system_alert',
  'birthday_reminder',
  'follow_up_reminder',
  'contract_expiry',
  'payment_due',
];

export const NOTIFICATION_PRIORITIES: NotificationPriority[] = [
  'low',
  'normal',
  'high',
  'urgent',
];

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  'in_app',
  'email',
  'sms',
  'push',
  'kakao',
];

export const NOTIFICATION_STATUSES: NotificationStatus[] = [
  'pending',
  'sent',
  'delivered',
  'read',
  'failed',
  'cancelled',
];

// 📌 타입 가드 함수들
export function isNotificationType(value: string): value is NotificationType {
  return NOTIFICATION_TYPES.includes(value as NotificationType);
}

export function isNotificationPriority(
  value: string
): value is NotificationPriority {
  return NOTIFICATION_PRIORITIES.includes(value as NotificationPriority);
}

export function isNotificationChannel(
  value: string
): value is NotificationChannel {
  return NOTIFICATION_CHANNELS.includes(value as NotificationChannel);
}

export function isNotificationStatus(
  value: string
): value is NotificationStatus {
  return NOTIFICATION_STATUSES.includes(value as NotificationStatus);
}
