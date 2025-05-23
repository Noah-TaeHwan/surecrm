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
}

export interface TeamStatsCardsProps {
  stats: TeamStats;
}

export interface InviteMemberProps {
  onInvite: (email: string, role: string, message?: string) => void;
}
