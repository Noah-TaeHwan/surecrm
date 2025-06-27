import type { LoaderFunction, MetaFunction } from 'react-router';

interface LoaderArgsInterface {
  request: Request;
  params: { clientId: string };
}

interface ActionArgsInterface {
  request: Request;
  params: { clientId: string };
}

interface LoaderDataInterface {
  client: any;
  clientOverview: any;
  availableStages: any[];
  insuranceContracts: any[];
  availableReferrers: Array<{ id: string; name: string }>;
  currentUserId: string | null;
  currentUser: {
    id: string;
    email: string;
    name: string;
  };
  isEmpty: boolean;
  error?: string;
}

interface ActionDataInterface {
  success?: boolean;
  error?: string;
  message?: string;
}

interface MetaArgsInterface {
  data: LoaderDataInterface;
  params: { clientId: string };
}

interface ComponentPropsInterface {
  loaderData: LoaderDataInterface;
  actionData?: ActionDataInterface;
  params: { clientId: string };
}

export namespace Route {
  export type LoaderArgs = LoaderArgsInterface;
  export type ActionArgs = ActionArgsInterface;
  export type LoaderData = LoaderDataInterface;
  export type ActionData = ActionDataInterface;
  export type MetaArgs = MetaArgsInterface;
  export type ComponentProps = ComponentPropsInterface;
}
