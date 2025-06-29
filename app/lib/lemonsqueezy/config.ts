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
    'LEMONSQUEEZY_VARIANT_ID',
  ];

  console.log('🍋 Lemon Squeezy 환경 변수 확인:', {
    LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY
      ? `${process.env.LEMONSQUEEZY_API_KEY.substring(0, 20)}...`
      : 'NOT_SET',
    LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID || 'NOT_SET',
    LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET
      ? '***SET***'
      : 'NOT_SET',
    LEMONSQUEEZY_BASE_URL: process.env.LEMONSQUEEZY_BASE_URL || 'NOT_SET',
    LEMONSQUEEZY_VARIANT_ID: process.env.LEMONSQUEEZY_VARIANT_ID || 'NOT_SET',
  });

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ 누락된 Lemon Squeezy 환경변수:', missingVars);
    throw new Error(
      `다음 Lemon Squeezy 환경변수가 설정되지 않았습니다: ${missingVars.join(
        ', '
      )}. .env 파일에 설정해주세요.`
    );
  }

  console.log('🍋 Lemon Squeezy SDK 설정 중...');
  console.log(
    `💰 Pro Plan 설정: Variant ${env.lemonSqueezy.variantId}, $${env.subscription.price} ${env.subscription.currency}/월, ${env.subscription.trialDays}일 무료체험`
  );

  lemonSqueezySetup({
    apiKey: env.lemonSqueezy.apiKey,
    onError: error => {
      console.error('Lemon Squeezy API 에러:', error);
    },
  });

  console.log('✅ Lemon Squeezy 설정 완료');
}

/**
 * Lemon Squeezy 설정 정보
 */
export const lemonSqueezyConfig = {
  apiKey: env.lemonSqueezy.apiKey,
  storeId: env.lemonSqueezy.storeId,
  webhookSecret: env.lemonSqueezy.webhookSecret,
  baseUrl: env.lemonSqueezy.baseUrl,
  variantId: env.lemonSqueezy.variantId,
  subscription: {
    price: env.subscription.price,
    currency: env.subscription.currency,
    trialDays: env.subscription.trialDays,
  },
} as const;
