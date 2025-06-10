// 환경 변수 타입 정의 및 검증
interface EnvConfig {
  toss: {
    clientKey: string;
    secretKey: string;
    webhookSecret: string;
    baseUrl: string;
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
  toss: {
    clientKey: getEnvVar('TOSS_CLIENT_KEY'),
    secretKey: getEnvVar('TOSS_SECRET_KEY'),
    webhookSecret: getEnvVar('TOSS_WEBHOOK_SECRET'),
    baseUrl: getEnvVar('TOSS_BASE_URL', 'https://api.tosspayments.com'),
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
    price: parseInt(getEnvVar('SUBSCRIPTION_PRICE', '39000')),
    currency: getEnvVar('SUBSCRIPTION_CURRENCY', 'KRW'),
  },

  billing: {
    encryptionKey: getEnvVar('BILLING_ENCRYPTION_KEY'),
    cronSecret: getEnvVar('CRON_SECRET'),
  },

  support: {
    email: getEnvVar('CUSTOMER_SUPPORT_EMAIL', 'support@surecrm.com'),
  },
};

// 환경 변수 검증 함수
export function validateEnvironment(): void {
  try {
    // 모든 필수 환경 변수가 있는지 확인
    env.toss.clientKey;
    env.toss.secretKey;
    env.service.url;
    env.service.publicUrl;

    console.log('✅ 환경 변수 검증 완료');
  } catch (error) {
    console.error('❌ 환경 변수 검증 실패:', error);
    throw error;
  }
}
