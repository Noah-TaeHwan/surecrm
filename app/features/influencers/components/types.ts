export interface Influencer {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  totalReferrals: number;
  successfulContracts: number;
  conversionRate: number;
  totalContractValue: number;
  networkDepth: number;
  networkWidth: number;
  lastGratitude: string;
  monthlyReferrals: number[];
  referralPattern: Record<string, number>;
  relationshipStrength: number;
}

export interface GratitudeHistoryItem {
  id: string;
  influencerId: string;
  influencerName: string;
  type: string;
  message: string;
  giftType: string | null;
  sentDate: string | null;
  scheduledDate: string | null;
  status: string;
}

export interface NetworkAnalysis {
  totalInfluencers: number;
  averageConversionRate: number;
  totalNetworkValue: number;
  avgNetworkDepth: number;
  avgNetworkWidth: number;
  monthlyGrowth: number;
}

export interface GratitudeFormData {
  type: string;
  message: string;
  giftType?: string;
  scheduledDate?: string;
}
