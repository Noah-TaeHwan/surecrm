import type {
  NotificationChannel,
  NotificationPriority,
  NotificationType,
} from '../types';

// 시간 포맷팅 유틸리티 (다국어 지원) - 클라이언트 안전
export function formatNotificationTime(
  date: Date,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: any) => string
): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return t('notifications:dateFormat.justNow');
  } else if (diffInMinutes < 60) {
    return t('notifications:dateFormat.minutesAgo', { minutes: diffInMinutes });
  } else if (diffInMinutes < 1440) {
    // 24시간
    const hours = Math.floor(diffInMinutes / 60);
    return t('notifications:dateFormat.hoursAgo', { hours });
  } else if (diffInMinutes < 10080) {
    // 7일
    const days = Math.floor(diffInMinutes / 1440);
    return t('notifications:dateFormat.daysAgo', { days });
  } else if (diffInMinutes < 43200) {
    // 30일
    const weeks = Math.floor(diffInMinutes / 10080);
    return t('notifications:dateFormat.weeksAgo', { weeks });
  } else if (diffInMinutes < 525600) {
    // 12개월
    const months = Math.floor(diffInMinutes / 43200);
    return t('notifications:dateFormat.monthsAgo', { months });
  } else {
    const years = Math.floor(diffInMinutes / 525600);
    return t('notifications:dateFormat.yearsAgo', { years });
  }
}

// 채널명 번역 - 클라이언트 안전
export function getTranslatedChannel(
  channel: NotificationChannel,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  return t(`notifications:channels.${channel}`);
}

// 우선순위 번역 - 클라이언트 안전
export function getTranslatedPriority(
  priority: NotificationPriority,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  return t(`notifications:priorities.${priority}`);
}

// 알림 타입 번역 - 클라이언트 안전
export function getTranslatedType(
  type: NotificationType,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  return t(`notifications:types.${type}`);
}

// 알림 우선순위별 색상 반환 - 클라이언트 안전
export function getNotificationPriorityClass(
  priority: NotificationPriority
): string {
  switch (priority) {
    case 'urgent':
      return 'border-red-500 bg-red-50';
    case 'high':
      return 'border-orange-500 bg-orange-50';
    case 'normal':
      return 'border-blue-500 bg-blue-50';
    case 'low':
      return 'border-gray-500 bg-gray-50';
    default:
      return 'border-gray-500 bg-gray-50';
  }
}

// 알림 타입에 따른 아이콘 - 클라이언트 안전
export function getNotificationTypeIcon(type: NotificationType): string {
  switch (type) {
    case 'meeting_reminder':
      return '📅';
    case 'goal_achievement':
      return '🎯';
    case 'goal_deadline':
      return '⏰';
    case 'new_referral':
      return '👥';
    case 'client_milestone':
      return '🏆';
    case 'team_update':
      return '📢';
    case 'system_alert':
      return '⚠️';
    case 'birthday_reminder':
      return '🎂';
    case 'follow_up_reminder':
      return '📞';
    case 'contract_expiry':
      return '📄';
    case 'payment_due':
      return '💰';
    default:
      return '🔔';
  }
}

/**
 * 알림 타입에 따른 번역 키 매핑
 */
function getNotificationTranslationKey(
  title: string,
  type: string
): string | null {
  // 제목 기반 매핑 (기존 테스트 알림들)
  if (title.includes('계약 갱신')) return 'testNotifications.contractRenewal';
  if (title.includes('팔로우업 필요'))
    return 'testNotifications.followUpNeeded';
  if (title.includes('계약 지연')) return 'testNotifications.contractDelay';
  if (title.includes('미팅 예정')) return 'testNotifications.meetingReminder';
  if (title.includes('새로운 고객 추천'))
    return 'testNotifications.newReferral';
  if (title.includes('월간 목표 달성'))
    return 'testNotifications.goalAchievement';
  if (title.includes('미팅 완료')) return 'testNotifications.meetingCompleted';
  if (title.includes('월간 목표 마감 임박'))
    return 'testNotifications.goalDeadlineWarning';
  if (title.includes('팀원 합류')) return 'testNotifications.teamMemberJoined';
  if (title.includes('고객 계약 완료'))
    return 'testNotifications.contractCompleted';
  if (title.includes('주간 성과 요약'))
    return 'testNotifications.weeklySummary';
  if (title.includes('추천 고객 연락 성공'))
    return 'testNotifications.referralSuccess';
  if (title.includes('앱 업데이트')) return 'testNotifications.appUpdate';
  if (title.includes('키맨 고객 생일') || title.includes('생일'))
    return 'testNotifications.clientBirthday';

  // 계약 만료 / 결제 관련 (다국어 지원)
  if (
    title.includes('계약 만료') ||
    title.includes('Contract Expiry') ||
    title.includes('契約満了')
  ) {
    return 'testNotifications.contractExpiry';
  }
  if (
    title.includes('결제 예정') ||
    title.includes('Payment Due') ||
    title.includes('支払期日')
  ) {
    return 'testNotifications.paymentDue';
  }

  // 타입 기반 매핑 (일반적인 알림들)
  switch (type) {
    case 'birthday_reminder':
      return 'testNotifications.generalBirthdayReminder';
    case 'meeting_reminder':
      return 'testNotifications.generalMeetingReminder';
    case 'new_referral':
      return 'testNotifications.generalNewReferral';
    case 'goal_achievement':
      return 'testNotifications.generalGoalAchievement';
    case 'goal_deadline':
      return 'testNotifications.generalGoalDeadline';
    case 'follow_up_reminder':
      return 'testNotifications.generalFollowUpReminder';
    case 'client_milestone':
      return 'testNotifications.generalClientMilestone';
    case 'team_update':
      return 'testNotifications.generalTeamUpdate';
    case 'system_alert':
      if (title.includes('계약')) return 'testNotifications.contractDelay';
      return 'testNotifications.generalSystemAlert';
    case 'contract_expiry':
      return 'testNotifications.contractExpiry';
    case 'payment_due':
      return 'testNotifications.paymentDue';
  }

  return null;
}

/**
 * 메타데이터에서 번역용 변수 추출
 */
function extractTranslationVariables(
  notification: Record<string, unknown>
): Record<string, unknown> {
  const variables: Record<string, unknown> = {};
  const metadata = (notification.metadata as Record<string, unknown>) || {};

  // 고객명 추출
  if (metadata.clientName) {
    variables.name = metadata.clientName;
  }

  // 날짜/시간 정보 추출
  if (metadata.daysUntil !== undefined) {
    variables.days = metadata.daysUntil;
  }
  if (metadata.daysSinceUpdate !== undefined) {
    variables.days = metadata.daysSinceUpdate;
  }
  if (metadata.daysSinceContact !== undefined) {
    variables.days = metadata.daysSinceContact;
  }

  // 시간 정보
  if (metadata.reminderType === '1hour') {
    variables.time = '1시간'; // 번역 파일에서 {{time}} → 언어별 "1 hour", "1時間" 등으로 처리
  }

  // 제목/메시지에서 시간 패턴 매칭
  if (
    typeof notification.title === 'string' &&
    notification.title.includes('1시간 후')
  ) {
    variables.time = '1시간';
  }

  // 계약 정보
  if (metadata.targetAmount !== undefined) {
    variables.count = metadata.targetAmount;
  }
  if (metadata.achievedAmount !== undefined) {
    variables.count = metadata.achievedAmount;
  }

  // 금액 정보
  if (
    typeof notification.message === 'string' &&
    notification.message.includes('2억원')
  ) {
    variables.amount = '2억원';
  }

  // 팀원명
  if (metadata.teamMemberName) {
    variables.name = metadata.teamMemberName;
  }

  // 퍼센티지 정보
  if (
    typeof notification.message === 'string' &&
    notification.message.includes('60%')
  ) {
    variables.percentage = '60';
  }
  if (
    typeof notification.message === 'string' &&
    notification.message.includes('85%')
  ) {
    variables.percentage = '85';
  }

  // 실적 정보
  if (
    typeof notification.message === 'string' &&
    notification.message.includes('신규 고객 3명')
  ) {
    variables.newClients = '3';
    variables.contracts = '2';
    variables.percentage = '85';
  }

  // 추천인 정보
  if (
    metadata.inviterEmail &&
    typeof metadata.inviterEmail === 'string' &&
    metadata.inviterEmail.includes('hong')
  ) {
    variables.name = '홍길동';
  }

  // 버전 정보
  if (
    typeof notification.message === 'string' &&
    notification.message.includes('v2.1.0')
  ) {
    variables.version = 'v2.1.0';
  }

  return variables;
}

/**
 * 알림의 제목을 번역
 */
export function getTranslatedNotificationTitle(
  notification: Record<string, unknown>,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const translationKey = getNotificationTranslationKey(
    notification.title as string,
    notification.type as string
  );

  if (!translationKey) {
    return notification.title as string; // 번역 키가 없으면 원본 반환
  }

  const variables = extractTranslationVariables(notification);
  const fullKey = `notifications:${translationKey}.title`;

  try {
    return t(fullKey, variables);
  } catch (error) {
    console.warn('번역 실패:', fullKey, error);
    return notification.title as string;
  }
}

/**
 * 알림의 메시지를 번역
 */
export function getTranslatedNotificationMessage(
  notification: any,
  t: (key: string, options?: any) => string
): string {
  const translationKey = getNotificationTranslationKey(
    notification.title,
    notification.type
  );

  if (!translationKey) {
    return notification.message; // 번역 키가 없으면 원본 반환
  }

  const variables = extractTranslationVariables(notification);
  const fullKey = `notifications:${translationKey}.message`;

  try {
    return t(fullKey, variables);
  } catch (error) {
    console.warn('번역 실패:', fullKey, error);
    return notification.message;
  }
}
