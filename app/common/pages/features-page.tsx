import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '~/common/layouts/landing-layout';

export default function FeaturesPage() {
  const { t, ready } = useTranslation('features');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 안전한 번역 함수 - 네임스페이스 로딩과 Hydration 체크
  const safeT = (key: string, options?: any): string => {
    if (!isHydrated || !ready) return '';
    const result = t(key, options);
    return typeof result === 'string' ? result : '';
  };

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            {safeT('title') || '주요 기능'}
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">
                {safeT('cards.smart_customer.title') || '스마트 고객 관리'}
              </h3>
              <p className="text-muted-foreground">
                {safeT('cards.smart_customer.description') ||
                  'AI 기반 고객 분석과 개인화된 관리 시스템으로 효율적인 고객 관계 구축'}
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">
                {safeT('cards.sales_pipeline.title') || '영업 파이프라인'}
              </h3>
              <p className="text-muted-foreground">
                {safeT('cards.sales_pipeline.description') ||
                  '직관적인 칸반 보드와 자동화된 워크플로우로 영업 프로세스 최적화'}
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">
                {safeT('cards.realtime_analytics.title') || '실시간 분석'}
              </h3>
              <p className="text-muted-foreground">
                {safeT('cards.realtime_analytics.description') ||
                  '고급 대시보드와 리포트를 통한 데이터 기반 의사결정 지원'}
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">
                {safeT('cards.mobile_optimized.title') || '모바일 최적화'}
              </h3>
              <p className="text-muted-foreground">
                {safeT('cards.mobile_optimized.description') ||
                  '언제 어디서나 접근 가능한 반응형 디자인과 모바일 앱'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
