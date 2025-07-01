import type { LoaderFunctionArgs } from 'react-router';

export interface MvpRedirectLoaderArgs extends LoaderFunctionArgs {}

export namespace Route {
  export type LoaderArgs = MvpRedirectLoaderArgs;
}
