// 미팅 유형별 색상
export const meetingTypeColors = {
  consultation: 'bg-blue-500 hover:bg-blue-600',
  follow_up: 'bg-green-500 hover:bg-green-600',
  presentation: 'bg-purple-500 hover:bg-purple-600',
  contract_signing: 'bg-orange-500 hover:bg-orange-600',
  claim_support: 'bg-red-500 hover:bg-red-600',
  renewal: 'bg-teal-500 hover:bg-teal-600',
  other: 'bg-gray-500 hover:bg-gray-600',
  // 🌐 구글 캘린더 이벤트 색상
  google:
    'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
} as const;

export type MeetingType = keyof typeof meetingTypeColors;

// 🌍 한국어 미팅 타입 매핑 (MVP 한국어 UI)
export const meetingTypeKoreanMap = {
  consultation: '상담',
  follow_up: '후속 상담',
  presentation: '설명회',
  contract_signing: '계약 체결',
  claim_support: '보험금 청구',
  renewal: '갱신 상담',
  other: '기타',
  google: '구글 일정',
} as const;

// 🎨 이벤트 소스별 스타일링 시스템
export const eventSourceStyles = {
  surecrm: {
    icon: '📋',
    gradient: 'from-primary to-primary/80',
    border: 'border-primary/20',
    textColor: 'text-white',
    indicatorColor: 'bg-primary',
  },
  google: {
    icon: '📅',
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-500/20',
    textColor: 'text-white',
    indicatorColor: 'bg-blue-500',
  },
  outlook: {
    icon: '📧',
    gradient: 'from-orange-500 to-orange-600',
    border: 'border-orange-500/20',
    textColor: 'text-white',
    indicatorColor: 'bg-orange-500',
  },
} as const;

export type EventSource = keyof typeof eventSourceStyles;

// 🔄 동기화 상태 타입
export type SyncStatus =
  | 'synced'
  | 'pending'
  | 'conflict'
  | 'failed'
  | 'not_synced';

// 🔄 동기화 상태별 UI 스타일
export const syncStatusStyles = {
  synced: {
    icon: 'CheckCircle',
    color: 'text-green-400',
    bgColor: 'bg-green-100',
    label: '동기화됨',
  },
  pending: {
    icon: 'Loader2',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-100',
    label: '동기화 중...',
    animate: 'animate-spin',
  },
  conflict: {
    icon: 'AlertTriangle',
    color: 'text-red-400',
    bgColor: 'bg-red-100',
    label: '충돌 발생',
  },
  failed: {
    icon: 'XCircle',
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: '동기화 실패',
  },
  not_synced: {
    icon: 'Circle',
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    label: '동기화 안됨',
  },
} as const;

// 🌐 구글 캘린더 확장 이벤트 인터페이스
export interface GoogleCalendarEvent extends Meeting {
  googleEventId: string;
  sourceIcon: '📅' | '📋' | '📧';
  syncStatus: SyncStatus;
  lastSyncAt?: Date;
  conflictData?: {
    googleVersion: Partial<Meeting>;
    localVersion: Partial<Meeting>;
    conflictFields: string[];
    detectedAt: Date;
  };
  // 구글 캘린더 특화 필드
  googleData?: {
    htmlLink?: string; // 구글 캘린더 웹 링크
    attendees?: Array<{
      email: string;
      displayName?: string;
      responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
    }>;
    conferenceData?: {
      // Google Meet 정보
      entryPoints: Array<{
        entryPointType: 'video' | 'phone';
        uri: string;
        label?: string;
      }>;
    };
    creator?: {
      email: string;
      displayName?: string;
    };
  };
}

// 📅 캘린더 설정 인터페이스 (고도화)
export interface CalendarSettings {
  agentId: string;

  // 구글 캘린더 연동 설정
  googleCalendarSync: boolean;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleCalendarId?: string; // 특정 캘린더 선택 시

  // 동기화 설정
  syncDirection: 'read_only' | 'write_only' | 'bidirectional';
  conflictResolution: 'google_wins' | 'local_wins' | 'manual';
  autoSyncInterval: number; // 분 단위 (기본값: 15분)

  // 동기화 범위 설정
  syncDateRange: {
    pastDays: number; // 과거 일정 동기화 범위 (기본값: 30일)
    futureDays: number; // 미래 일정 동기화 범위 (기본값: 365일)
  };

  // 필터링 설정
  excludePatterns: string[]; // 제목에 포함된 패턴 제외 (예: "개인", "private")
  includeOnlyPatterns?: string[]; // 특정 패턴만 포함 (선택적)
  excludeAllDayEvents: boolean; // 종일 이벤트 제외 여부

  // UI 설정
  showGoogleEventsOnCalendar: boolean; // SureCRM 캘린더에서 구글 이벤트 표시 여부
  googleEventOpacity: number; // 구글 이벤트 투명도 (0.5 ~ 1.0)

  // 알림 설정
  notifyOnSyncConflicts: boolean;
  notifyOnSyncErrors: boolean;

  // 메타데이터
  lastSyncAt?: Date;
  lastSuccessfulSyncAt?: Date;
  syncErrorCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 🔄 동기화 로그 인터페이스
export interface SyncLog {
  id: string;
  agentId: string;
  eventId?: string; // 관련 이벤트 ID (있는 경우)
  syncDirection: 'to_google' | 'from_google';
  status: 'success' | 'failed' | 'conflict';
  errorMessage?: string;
  conflictDetails?: {
    field: string;
    googleValue: any;
    localValue: any;
  }[];
  syncedAt: Date;
  processingTimeMs: number;
}

// ⚡ 충돌 해결 관련 타입
export interface ConflictData {
  eventId: string;
  title: string;
  googleVersion: Partial<Meeting>;
  localVersion: Partial<Meeting>;
  conflictFields: Array<{
    field: string;
    googleValue: any;
    localValue: any;
    priority: 'high' | 'medium' | 'low';
  }>;
  detectedAt: Date;
  autoResolvable: boolean; // 자동 해결 가능 여부
}

// 기존 Meeting 인터페이스 확장
export interface Meeting {
  id: string;
  title: string;
  client: Client;
  date: string;
  time: string;
  duration: number;
  type: string;
  location: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  checklist: ChecklistItem[];
  notes?: MeetingNote[];

  // 🌐 구글 캘린더 연동 정보 (확장)
  syncInfo?: {
    externalSource: EventSource;
    externalEventId?: string;
    lastSyncAt?: string;
    syncStatus?: SyncStatus;
    conflictResolved?: boolean;
    manuallyEdited?: boolean; // 수동 편집 여부 (동기화 우선순위 결정용)
  };
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface MeetingNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export type ViewMode = 'month' | 'week' | 'day';

// 이벤트 소스별 아이콘 (기존 유지하되 확장)
export const eventSourceIcons = {
  surecrm: '📋', // SureCRM 미팅
  google: '📅', // 구글 캘린더 이벤트
  outlook: '📧', // 향후 Outlook 연동용
} as const;

// 🎯 캘린더 테마 컬러 시스템 (SureCRM 브랜딩 기반)
export const calendarTheme = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  accent: 'var(--accent)',

  // 이벤트 소스별 그라디언트
  gradients: {
    surecrm: 'from-primary to-primary/80',
    google: 'from-blue-500 to-blue-600',
    outlook: 'from-orange-500 to-orange-600',
  },

  // 동기화 상태별 컬러
  syncColors: {
    synced: 'emerald',
    pending: 'yellow',
    conflict: 'red',
    failed: 'red',
    not_synced: 'gray',
  },
} as const;
