import type { LoaderFunctionArgs } from 'react-router';

export interface InfluencersRedirectLoaderArgs extends LoaderFunctionArgs {}

export namespace Route {
  export type LoaderArgs = InfluencersRedirectLoaderArgs;
}
