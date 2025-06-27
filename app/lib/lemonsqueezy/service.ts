import {
  createCheckout,
  listProducts,
  listPrices,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  getProduct,
} from '@lemonsqueezy/lemonsqueezy.js';
import type {
  Subscription,
  Product,
  Variant,
  Price,
} from '@lemonsqueezy/lemonsqueezy.js';
import { configureLemonSqueezy, lemonSqueezyConfig } from './config';

export interface LemonSqueezyCheckoutOptions {
  variantId: number;
  userId: string;
  userEmail: string;
  redirectUrl?: string;
  embed?: boolean;
}

export interface LemonSqueezyPlan {
  id: number;
  productId: number;
  productName: string;
  variantId: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  interval: string;
  intervalCount: number;
  isUsageBased: boolean;
}

/**
 * Lemon Squeezy 결제 서비스 클래스
 */
export class LemonSqueezyService {
  constructor() {
    configureLemonSqueezy();
  }

  /**
   * 체크아웃 세션 생성
   */
  async createCheckoutSession(
    options: LemonSqueezyCheckoutOptions
  ): Promise<string> {
    try {
      const checkout = await createCheckout(
        lemonSqueezyConfig.storeId,
        options.variantId,
        {
          checkoutOptions: {
            embed: options.embed || false,
            media: false,
            logo: !options.embed,
          },
          checkoutData: {
            email: options.userEmail,
            custom: {
              user_id: options.userId,
            },
          },
          productOptions: {
            enabledVariants: [options.variantId],
            redirectUrl:
              options.redirectUrl ||
              `${process.env.NEXT_PUBLIC_SERVICE_URL}/billing/`,
            receiptButtonText: '대시보드로 이동',
            receiptThankYouNote: 'SureCRM 구독해주셔서 감사합니다!',
          },
        }
      );

      if (!checkout.data?.data.attributes.url) {
        throw new Error('체크아웃 URL 생성에 실패했습니다.');
      }

      return checkout.data.data.attributes.url;
    } catch (error) {
      console.error('Lemon Squeezy 체크아웃 생성 실패:', error);
      throw new Error('결제 페이지 생성에 실패했습니다.');
    }
  }

  /**
   * 스토어의 모든 상품 및 변형 조회
   */
  async syncPlans(): Promise<LemonSqueezyPlan[]> {
    try {
      const products = await listProducts({
        filter: { storeId: lemonSqueezyConfig.storeId },
        include: ['variants'],
      });

      const plans: LemonSqueezyPlan[] = [];
      const allVariants = products.data?.included as
        | Variant['data'][]
        | undefined;

      if (allVariants) {
        for (const variant of allVariants) {
          const variantAttributes = variant.attributes;

          // 드래프트 상태이거나 대기 중인 변형은 건너뛰기
          if (
            variantAttributes.status === 'draft' ||
            (allVariants.length !== 1 && variantAttributes.status === 'pending')
          ) {
            continue;
          }

          // 상품 정보 가져오기
          const productResponse = await getProduct(
            variantAttributes.product_id
          );
          const productName = productResponse.data?.data.attributes.name ?? '';

          // 가격 정보 가져오기
          const pricesResponse = await listPrices({
            filter: { variantId: variant.id },
          });

          const priceObj = pricesResponse.data?.data.at(0);

          if (!priceObj || priceObj.attributes.category !== 'subscription') {
            continue; // 구독이 아닌 상품은 건너뛰기
          }

          const isUsageBased = priceObj.attributes.usage_aggregation !== null;
          const price = isUsageBased
            ? priceObj.attributes.unit_price_decimal
            : priceObj.attributes.unit_price;

          plans.push({
            id: parseInt(variant.id),
            productId: variantAttributes.product_id,
            productName,
            variantId: parseInt(variant.id),
            name: variantAttributes.name,
            description: variantAttributes.description,
            price: price?.toString() ?? '0',
            currency: 'KRW', // 기본값
            interval: priceObj.attributes.renewal_interval_unit ?? 'month',
            intervalCount: priceObj.attributes.renewal_interval_quantity ?? 1,
            isUsageBased,
          });
        }
      }

      return plans;
    } catch (error) {
      console.error('Lemon Squeezy 플랜 동기화 실패:', error);
      throw new Error('플랜 정보를 가져오는데 실패했습니다.');
    }
  }

  /**
   * 구독 정보 조회
   */
  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await getSubscription(subscriptionId);
      return subscription.data?.data;
    } catch (error) {
      console.error('구독 정보 조회 실패:', error);
      throw new Error('구독 정보를 가져오는데 실패했습니다.');
    }
  }

  /**
   * 구독 업데이트
   */
  async updateSubscription(subscriptionId: string, data: any) {
    try {
      const updatedSubscription = await updateSubscription(
        subscriptionId,
        data
      );
      return updatedSubscription.data?.data;
    } catch (error) {
      console.error('구독 업데이트 실패:', error);
      throw new Error('구독 업데이트에 실패했습니다.');
    }
  }

  /**
   * 구독 취소
   */
  async cancelSubscription(subscriptionId: string) {
    try {
      const cancelledSubscription = await cancelSubscription(subscriptionId);
      return cancelledSubscription.data?.data;
    } catch (error) {
      console.error('구독 취소 실패:', error);
      throw new Error('구독 취소에 실패했습니다.');
    }
  }

  /**
   * 구독 일시정지
   */
  async pauseSubscription(subscriptionId: string) {
    try {
      const pausedSubscription = await updateSubscription(subscriptionId, {
        pause: { mode: 'void' },
      });
      return pausedSubscription.data?.data;
    } catch (error) {
      console.error('구독 일시정지 실패:', error);
      throw new Error('구독 일시정지에 실패했습니다.');
    }
  }

  /**
   * 구독 재개
   */
  async resumeSubscription(subscriptionId: string) {
    try {
      const resumedSubscription = await updateSubscription(subscriptionId, {
        pause: null,
      });
      return resumedSubscription.data?.data;
    } catch (error) {
      console.error('구독 재개 실패:', error);
      throw new Error('구독 재개에 실패했습니다.');
    }
  }

  /**
   * 고객 포털 URL 생성
   */
  async getCustomerPortalUrl(subscriptionId: string): Promise<string> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      return subscription?.attributes.urls?.customer_portal || '';
    } catch (error) {
      console.error('고객 포털 URL 생성 실패:', error);
      throw new Error('고객 포털 URL 생성에 실패했습니다.');
    }
  }

  /**
   * 결제 방법 업데이트 URL 생성
   */
  async getUpdatePaymentMethodUrl(subscriptionId: string): Promise<string> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      return subscription?.attributes.urls?.update_payment_method || '';
    } catch (error) {
      console.error('결제 방법 업데이트 URL 생성 실패:', error);
      throw new Error('결제 방법 업데이트 URL 생성에 실패했습니다.');
    }
  }
}

// 싱글톤 인스턴스
export const lemonSqueezyService = new LemonSqueezyService();
