import type { LoaderFunction, MetaFunction } from 'react-router';

type JoinStatus =
  | 'loading'
  | 'valid'
  | 'invalid'
  | 'expired'
  | 'used'
  | 'error';

interface LoaderArgsInterface {
  request: Request;
  params: { code: string };
}

interface ActionArgsInterface {
  request: Request;
  params: { code: string };
}

interface LoaderDataInterface {
  status: JoinStatus;
  team?: any;
  invitation?: any;
  inviter?: any;
  currentUser?: any;
  code?: string;
  error?: string;
}

interface ActionDataInterface {
  success?: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
}

interface MetaArgsInterface {
  data: LoaderDataInterface;
  params: { code: string };
}

interface ComponentPropsInterface {
  loaderData: LoaderDataInterface;
  actionData?: ActionDataInterface;
  params: { code: string };
}

export namespace Route {
  export type LoaderArgs = LoaderArgsInterface;
  export type ActionArgs = ActionArgsInterface;
  export type LoaderData = LoaderDataInterface;
  export type ActionData = ActionDataInterface;
  export type MetaArgs = MetaArgsInterface;
  export type ComponentProps = ComponentPropsInterface;
}
