export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joinedAt?: string;
  invitedAt?: string;
  lastSeen?: string;
  clients: number;
  conversions: number;
  phone?: string;
  company?: string;
  position?: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  totalClients: number;
}

export interface TeamMemberListProps {
  members: TeamMember[];
  onRemoveMember: (memberId: string) => void;
  onResendInvite: (memberId: string) => void;
  onViewMember: (member: TeamMember) => void;
}

export interface TeamStatsCardsProps {
  stats: TeamStats;
}

export interface InviteMemberProps {
  onInvite: (email: string, role: string, message?: string) => void;
}

export interface TeamMemberProfileProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
}
