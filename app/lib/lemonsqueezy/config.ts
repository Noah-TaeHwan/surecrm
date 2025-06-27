import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { env } from '../env';

/**
 * Lemon Squeezy SDK 초기화
 * 필수 환경변수가 설정되어 있는지 확인하고 SDK를 설정합니다.
 */
export function configureLemonSqueezy() {
  const requiredVars = [
    'LEMONSQUEEZY_API_KEY',
    'LEMONSQUEEZY_STORE_ID',
    'LEMONSQUEEZY_WEBHOOK_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `다음 Lemon Squeezy 환경변수가 설정되지 않았습니다: ${missingVars.join(
        ', '
      )}. .env 파일에 설정해주세요.`
    );
  }

  lemonSqueezySetup({
    apiKey: env.lemonSqueezy.apiKey,
    onError: error => {
      console.error('Lemon Squeezy API 에러:', error);
    },
  });
}

/**
 * Lemon Squeezy 설정 정보
 */
export const lemonSqueezyConfig = {
  apiKey: env.lemonSqueezy.apiKey,
  storeId: env.lemonSqueezy.storeId,
  webhookSecret: env.lemonSqueezy.webhookSecret,
  baseUrl: env.lemonSqueezy.baseUrl,
} as const;
