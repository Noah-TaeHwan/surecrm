import type { LoaderFunction, MetaFunction } from 'react-router';

interface LoaderArgsInterface {
  request: Request;
}

interface LoaderDataInterface {
  sessionId: string | null;
  customerId: string | null;
}

interface MetaArgsInterface {}

interface ComponentPropsInterface {
  loaderData: LoaderDataInterface;
}

export namespace Route {
  export type LoaderArgs = LoaderArgsInterface;
  export type LoaderData = LoaderDataInterface;
  export type MetaArgs = MetaArgsInterface;
  export type ComponentProps = ComponentPropsInterface;
}
