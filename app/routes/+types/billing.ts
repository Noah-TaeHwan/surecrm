import type { LoaderFunction, MetaFunction } from 'react-router';

interface LoaderArgsInterface {
  request: Request;
}

interface ActionArgsInterface {
  request: Request;
}

interface LoaderDataInterface {
  variantId?: number;
  subscriptionStatus?: {
    isActive: boolean;
    isTrialActive: boolean;
    trialEndsAt: Date | null;
    subscriptionEndsAt: Date | null;
    daysRemaining: number;
    needsPayment: boolean;
  };
  user?: any | null;
}

interface ActionDataInterface {
  error?: string;
}

interface MetaArgsInterface {}

interface ComponentPropsInterface {
  loaderData: LoaderDataInterface;
  actionData?: ActionDataInterface;
}

export namespace Route {
  export type LoaderArgs = LoaderArgsInterface;
  export type ActionArgs = ActionArgsInterface;
  export type LoaderData = LoaderDataInterface;
  export type ActionData = ActionDataInterface;
  export type MetaArgs = MetaArgsInterface;
  export type ComponentProps = ComponentPropsInterface;
}
