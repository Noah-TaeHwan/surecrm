// ===== 팀 관리 핵심 타입 정의 (MVP용) =====

// 팀원 역할 타입 (MVP 3단계)
export type TeamMemberRole = 'admin' | 'manager' | 'member';

// 팀원 상태 타입
export type TeamMemberStatus = 'active' | 'pending' | 'inactive';

// 팀원 정보 인터페이스 (MVP 핵심 정보만)
export interface TeamMember {
  id: string;
  name?: string; // 선택적 (초대 시에는 없을 수 있음)
  email?: string; // 선택적 (프라이버시 고려)
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joinedAt?: string; // 가입일 (활성 멤버만)
  invitedAt?: string; // 초대일 (대기 멤버만)
  lastSeen?: string; // 마지막 접속 (활성 멤버만)
  clients: number; // 담당 고객 수
  conversions: number; // 계약 성사 수
  phone?: string; // 연락처 (선택적)
  company?: string; // 소속 회사 (선택적)
  position?: string; // 직책 (선택적)
}

// 팀 통계 인터페이스 (MVP 핵심 지표)
export interface TeamStats {
  totalMembers: number; // 총 팀원 수 (활성 + 대기)
  activeMembers: number; // 활성 팀원 수
  pendingInvites: number; // 대기 중인 초대 수
  totalClients: number; // 팀 전체 고객 수
}

// ===== 컴포넌트 Props 타입들 =====

// 팀원 목록 컴포넌트 Props
export interface TeamMemberListProps {
  members: TeamMember[];
  onRemoveMember: (memberId: string) => void;
  onResendInvite: (memberId: string) => void;
  onViewMember: (member: TeamMember) => void;
}

// 팀 통계 카드 컴포넌트 Props
export interface TeamStatsCardsProps {
  stats: TeamStats;
}

// 팀원 초대 컴포넌트 Props
export interface InviteMemberProps {
  onInvite: (email: string, role: string, message?: string) => void;
}

// 팀원 프로필 컴포넌트 Props
export interface TeamMemberProfileProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
}

// ===== 유틸리티 타입들 =====

// 역할별 권한 정의 (MVP용)
export interface TeamRolePermissions {
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canViewAllClients: boolean;
  canManageTeamSettings: boolean;
}

// 역할별 권한 매핑
export const TEAM_ROLE_PERMISSIONS: Record<
  TeamMemberRole,
  TeamRolePermissions
> = {
  admin: {
    canInviteMembers: true,
    canRemoveMembers: true,
    canViewAllClients: true,
    canManageTeamSettings: true,
  },
  manager: {
    canInviteMembers: true,
    canRemoveMembers: false,
    canViewAllClients: true,
    canManageTeamSettings: false,
  },
  member: {
    canInviteMembers: false,
    canRemoveMembers: false,
    canViewAllClients: false,
    canManageTeamSettings: false,
  },
};

// 역할 표시명 매핑
export const TEAM_ROLE_LABELS: Record<TeamMemberRole, string> = {
  admin: '관리자',
  manager: '매니저',
  member: '멤버',
};

// 상태 표시명 매핑
export const TEAM_STATUS_LABELS: Record<TeamMemberStatus, string> = {
  active: '활성',
  pending: '대기 중',
  inactive: '비활성',
};
