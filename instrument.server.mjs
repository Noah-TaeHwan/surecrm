import * as Sentry from '@sentry/react-router';

Sentry.init({
  dsn: 'https://8193c277a9cc1a3fe000ad5550db6412@o4509563207876608.ingest.us.sentry.io/4509563214364672',

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
