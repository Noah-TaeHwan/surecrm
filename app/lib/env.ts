// 환경 변수 타입 정의 및 검증
interface EnvConfig {
  lemonSqueezy: {
    apiKey: string;
    storeId: string;
    webhookSecret: string;
    baseUrl: string;
    variantId: string;
  };
  payment: {
    mode: 'test' | 'production';
  };
  service: {
    url: string;
    publicUrl: string;
  };
  subscription: {
    planId: string;
    price: number;
    currency: string;
    trialDays: number;
  };
  billing: {
    encryptionKey: string;
    cronSecret: string;
  };
  support: {
    email: string;
  };
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;

  if (!value) {
    throw new Error(`환경 변수 ${name}이 설정되지 않았습니다.`);
  }

  return value;
}

export const env: EnvConfig = {
  lemonSqueezy: {
    apiKey: getEnvVar('LEMONSQUEEZY_API_KEY'),
    storeId: getEnvVar('LEMONSQUEEZY_STORE_ID'),
    webhookSecret: getEnvVar('LEMONSQUEEZY_WEBHOOK_SECRET'),
    baseUrl: getEnvVar('LEMONSQUEEZY_BASE_URL', 'https://api.lemonsqueezy.com'),
    variantId: getEnvVar('LEMONSQUEEZY_VARIANT_ID', '876185'),
  },

  payment: {
    mode: getEnvVar('PAYMENT_MODE', 'test') as 'test' | 'production',
  },

  service: {
    url: getEnvVar('SERVICE_URL'),
    publicUrl: getEnvVar('NEXT_PUBLIC_SERVICE_URL'),
  },

  subscription: {
    planId: getEnvVar('SUBSCRIPTION_PLAN_ID', 'surecrm-pro'),
    price: parseInt(getEnvVar('SUBSCRIPTION_PRICE', '20')),
    currency: getEnvVar('SUBSCRIPTION_CURRENCY', 'USD'),
    trialDays: parseInt(getEnvVar('SUBSCRIPTION_TRIAL_DAYS', '14')),
  },

  billing: {
    encryptionKey: getEnvVar('BILLING_ENCRYPTION_KEY'),
    cronSecret: getEnvVar('CRON_SECRET'),
  },

  support: {
    email: getEnvVar('CUSTOMER_SUPPORT_EMAIL', 'noah@surecrm.pro'),
  },
};

// 환경 변수 검증 함수
export function validateEnvironment(): void {
  try {
    // 모든 필수 환경 변수가 있는지 확인
    env.lemonSqueezy.apiKey;
    env.lemonSqueezy.storeId;
    env.lemonSqueezy.variantId;
    env.service.url;
    env.service.publicUrl;

    console.log('✅ 환경 변수 검증 완료');
    console.log('🍋 Lemon Squeezy Pro Plan 설정:', {
      variantId: env.lemonSqueezy.variantId,
      price: `$${env.subscription.price}`,
      currency: env.subscription.currency,
      trialDays: `${env.subscription.trialDays}일`,
    });
  } catch (error) {
    console.error('❌ 환경 변수 검증 실패:', error);
    throw error;
  }
}
