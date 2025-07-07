import type { LoaderFunctionArgs } from 'react-router';

export interface LoaderArgs extends LoaderFunctionArgs {}

export interface LoaderData {
  users: Array<{
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    role: string;
    subscriptionStatus: string;
    trialEndsAt: string | null;
    subscriptionEndsAt: string | null;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    lemonSqueezySubscriptionId: string | null;
    profileImageUrl: string | null;
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  stats: {
    total: number;
    active: number;
    trial: number;
    cancelled: number;
    inactive: number;
  };
  search: string;
  status: string;
  role: string;
  error?: string;
}
