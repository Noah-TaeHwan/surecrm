import type { LoaderFunctionArgs } from 'react-router';

export interface SitemapLoaderArgs extends LoaderFunctionArgs {}

export namespace Route {
  export type LoaderArgs = SitemapLoaderArgs;
}
