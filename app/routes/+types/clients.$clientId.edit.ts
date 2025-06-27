import type {
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from 'react-router';

interface LoaderArgsInterface {
  request: Request;
  params: {
    clientId: string;
  };
}

interface ActionArgsInterface {
  request: Request;
  params: {
    clientId: string;
  };
}

interface LoaderDataInterface {
  client: any;
  currentUserId: string;
}

interface ActionDataInterface {
  success?: boolean;
  error?: string;
}

interface MetaArgsInterface {
  data: LoaderDataInterface;
}

interface ComponentPropsInterface {
  loaderData: LoaderDataInterface;
  actionData?: ActionDataInterface;
  params: {
    clientId: string;
  };
}

export namespace Route {
  export type LoaderArgs = LoaderArgsInterface;
  export type ActionArgs = ActionArgsInterface;
  export type LoaderData = LoaderDataInterface;
  export type ActionData = ActionDataInterface;
  export type MetaArgs = MetaArgsInterface;
  export type ComponentProps = ComponentPropsInterface;
}
