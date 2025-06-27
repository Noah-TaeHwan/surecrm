import type { LoaderFunction, MetaFunction } from 'react-router';

interface LoaderArgsInterface {
  request: Request;
}

interface ActionArgsInterface {
  request: Request;
}

interface LoaderDataInterface {
  meetings: any[];
  clients: any[];
  googleCalendarSettings: any;
  requiresGoogleConnection: boolean;
  error?: string;
}

interface ActionDataInterface {
  success?: boolean;
  error?: string;
  message?: string;
}

interface MetaArgsInterface {
  data: LoaderDataInterface;
}

interface ComponentPropsInterface {
  loaderData: LoaderDataInterface;
  actionData?: ActionDataInterface;
  params: {};
}

export namespace Route {
  export type LoaderArgs = LoaderArgsInterface;
  export type ActionArgs = ActionArgsInterface;
  export type LoaderData = LoaderDataInterface;
  export type ActionData = ActionDataInterface;
  export type MetaArgs = MetaArgsInterface;
  export type ComponentProps = ComponentPropsInterface;
}
