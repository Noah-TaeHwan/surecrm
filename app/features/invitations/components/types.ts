export interface Invitation {
  id: string;
  code: string;
  status: 'available' | 'used';
  createdAt: string;
  usedAt?: string;
  invitee?: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  };
}

export interface InvitationStatsProps {
  availableCount: number;
  usedInvitations: Invitation[];
}

export interface InvitationCardProps {
  invitation: Invitation;
  onCopyLink: (code: string) => void;
  copiedCode: string | null;
}

export interface InvitedColleaguesProps {
  usedInvitations: Invitation[];
}
