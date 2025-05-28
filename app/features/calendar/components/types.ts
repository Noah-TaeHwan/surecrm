// 미팅 유형별 색상
export const meetingTypeColors = {
  '첫 상담': 'bg-blue-500',
  '니즈 분석': 'bg-purple-500',
  '상품 설명': 'bg-orange-500',
  '계약 검토': 'bg-yellow-500',
  '계약 체결': 'bg-green-500',
  '정기 점검': 'bg-gray-500',
} as const;

export type MeetingType = keyof typeof meetingTypeColors;

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
