import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

export type LoaderArgsInterface = LoaderFunctionArgs;
export type ActionArgsInterface = ActionFunctionArgs;

interface ContactItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  respondedAt: Date | null;
  respondedBy: string | null;
  responseMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}

export interface LoaderDataInterface {
  contacts: ContactItem[];
  stats: ContactStats;
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
