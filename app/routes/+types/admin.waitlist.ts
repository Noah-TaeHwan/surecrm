import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

export type LoaderArgsInterface = LoaderFunctionArgs;
export type ActionArgsInterface = ActionFunctionArgs;

interface WaitlistItem {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string | null;
  message: string | null;
  source: string | null;
  isContacted: boolean;
  contactedAt: Date | null;
  contactedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface WaitlistStats {
  total: number;
  contacted: number;
  notContacted: number;
}

export interface LoaderDataInterface {
  waitlist: WaitlistItem[];
  stats: WaitlistStats;
  search: string;
  status: string;
  error?: string;
}

export interface ActionDataInterface {
  success: boolean;
  message: string;
}

export interface ComponentPropsInterface {
  loaderData: LoaderDataInterface;
  actionData?: ActionDataInterface;
}

export namespace Route {
  export type LoaderArgs = LoaderArgsInterface;
  export type ActionArgs = ActionArgsInterface;
  export type LoaderData = LoaderDataInterface;
  export type ActionData = ActionDataInterface;
  export type ComponentProps = ComponentPropsInterface;
}
