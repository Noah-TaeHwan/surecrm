import type { ActionFunction, MetaFunction } from 'react-router';

interface ActionArgsInterface {
  request: Request;
}

interface ActionDataInterface {
  success?: boolean;
  error?: string;
  message?: string;
}

interface ComponentPropsInterface {
  actionData?: ActionDataInterface | null;
}

export namespace Route {
  export type ActionArgs = ActionArgsInterface;
  export type ActionData = ActionDataInterface;
  export type ComponentProps = ComponentPropsInterface;
}
