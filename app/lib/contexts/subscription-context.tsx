import React, { createContext, useContext, useState, useEffect } from 'react';

interface SubscriptionStatus {
  needsPayment: boolean;
  isTrialActive: boolean;
  daysRemaining: number;
}

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  setSubscriptionStatus: (status: SubscriptionStatus | null) => void;
  isLoading: boolean;
  fetchSubscriptionStatus: (
    currentUser?: { id: string } | null
  ) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({
  children,
  initialStatus = null,
}: {
  children: React.ReactNode;
  initialStatus?: SubscriptionStatus | null;
}) {
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubscriptionStatus = async (
    currentUser?: { id: string } | null
  ) => {
    // 이미 로딩 중이거나 사용자 정보가 없으면 스킵
    if (isLoading || !currentUser?.id || currentUser.id === 'unknown') {
      return;
    }

    // 이미 구독 상태가 있으면 스킵 (한 번만 확인)
    if (subscriptionStatus !== null) {
      return;
    }

    setIsLoading(true);

    try {
      // console.log('🔍 SubscriptionContext: 구독 상태 확인 시작', {
      //   userId: currentUser.id,
      // });

      const response = await fetch('/api/auth/subscription-status', {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const statusData = await response.json();
          // console.log('✅ SubscriptionContext: 구독 상태 데이터', statusData);

          const newStatus = {
            needsPayment: statusData.needsPayment || false,
            isTrialActive: statusData.isTrialActive || false,
            daysRemaining: statusData.daysRemaining || 0,
          };

          setSubscriptionStatus(newStatus);
        } else {
          console.error('❌ SubscriptionContext: 예상치 못한 응답 형식');
          // API 실패 시 기본값 (구독 필요)
          setSubscriptionStatus({
            needsPayment: true,
            isTrialActive: false,
            daysRemaining: 0,
          });
        }
      } else {
        console.error('❌ SubscriptionContext: API 응답 실패', response.status);
        setSubscriptionStatus({
          needsPayment: true,
          isTrialActive: false,
          daysRemaining: 0,
        });
      }
    } catch (error) {
      console.warn('SubscriptionContext: 구독 상태 확인 실패:', error);
      setSubscriptionStatus({
        needsPayment: true,
        isTrialActive: false,
        daysRemaining: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionStatus,
        setSubscriptionStatus,
        isLoading,
        fetchSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider'
    );
  }
  return context;
}
