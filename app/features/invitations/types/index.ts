// SureCRM MVP 추천 코드 시스템 타입 정의

/**
 * 추천 코드 (구 Invitation) - MVP 단순화
 */
export interface ReferralCode {
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
  // MVP: expiresAt, personalMessage, source 제거 (단순화)
}

/**
 * 레거시 호환성을 위한 Invitation 타입 (내부적으로는 ReferralCode 사용)
 */
export interface Invitation extends ReferralCode {}

/**
 * 추천 코드 통계 컴포넌트 Props (새로운 구조)
 */
export interface ReferralStatsProps {
  availableCount: number;
  usedCodes: ReferralCode[];
}

/**
 * 추천 코드 카드 컴포넌트 Props (새로운 구조)
 */
export interface ReferralCardProps {
  referralCode: ReferralCode;
  onCopyLink: (code: string) => void;
  copiedCode: string | null;
}

/**
 * 추천한 동료들 컴포넌트 Props (새로운 구조)
 */
export interface ReferredColleaguesProps {
  usedCodes: ReferralCode[];
}

// 레거시 호환성을 위한 기존 인터페이스들 (독립적으로 정의)
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

/**
 * MVP 추천 코드 시스템 상태
 */
export interface ReferralSystemState {
  availableCodes: ReferralCode[];
  usedCodes: ReferralCode[];
  totalGenerated: number;
  successfulReferrals: number;
}

/**
 * 추천 코드 생성 옵션 (MVP 단순화)
 */
export interface CreateReferralCodeOptions {
  userId: string;
  // MVP: 복잡한 옵션들 제거 (message, expiresAt, source 등)
}

/**
 * 추천 코드 사용 결과
 */
export interface UseReferralCodeResult {
  success: boolean;
  referralCode?: ReferralCode;
  error?: string;
  newUserGained2Codes?: boolean; // MVP: 신규 사용자는 2개 코드 획득
}
