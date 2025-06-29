import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '~/common/layouts/landing-layout';

export default function IntegrationsPage() {
  const { t, ready } = useTranslation('integrations');
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

  // 안전한 배열 번역 함수
  const safeArrayT = (key: string, fallback: string[]) => {
    if (!isHydrated || !ready) return fallback;
    const result = t(key, { returnObjects: true });
    return Array.isArray(result) ? result : fallback;
  };

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            {safeT('title') || '연동 & 문서'}
          </h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            {safeT('subtitle') ||
              'SureCRM과 다양한 서비스를 연동하고 API 문서를 확인하세요'}
          </p>

          <div className="space-y-12">
            {/* API 문서 섹션 */}
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {safeT('sections.api.title') || 'API 문서'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-3">
                    {safeT('sections.api.rest.title') || '📘 REST API'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {safeT('sections.api.rest.description') ||
                      'RESTful API를 통해 고객 데이터, 파이프라인, 리포트에 접근하세요'}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {safeArrayT('sections.api.rest.features', [
                      '고객 관리 API',
                      '파이프라인 API',
                      '분석 데이터 API',
                      '인증 및 권한 관리',
                    ]).map((feature: string, index: number) => (
                      <div key={index}>
                        • {feature}
                        <br />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-3">
                    {safeT('sections.api.webhook.title') || '🔗 Webhook'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {safeT('sections.api.webhook.description') ||
                      '실시간 이벤트 알림을 받아 자동화된 워크플로우를 구축하세요'}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {safeArrayT('sections.api.webhook.features', [
                      '고객 상태 변경',
                      '파이프라인 업데이트',
                      '작업 완료 알림',
                      '보안 이벤트',
                    ]).map((feature: string, index: number) => (
                      <div key={index}>
                        • {feature}
                        <br />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 연동 서비스 */}
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {safeT('sections.services.title') || '지원 연동 서비스'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card rounded-lg p-6 border text-center">
                  <div className="text-2xl mb-3">📧</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {safeT('sections.services.email.title') || '이메일 서비스'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {safeT('sections.services.email.description') ||
                      'Gmail, Outlook과 연동하여 고객과의 이메일을 자동으로 관리하세요'}
                  </p>
                </div>

                <div className="bg-card rounded-lg p-6 border text-center">
                  <div className="text-2xl mb-3">📅</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {safeT('sections.services.calendar.title') || '캘린더 연동'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {safeT('sections.services.calendar.description') ||
                      'Google Calendar, Office 365와 연동하여 일정을 동기화하세요'}
                  </p>
                </div>

                <div className="bg-card rounded-lg p-6 border text-center">
                  <div className="text-2xl mb-3">💬</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {safeT('sections.services.messenger.title') ||
                      '메신저 연동'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {safeT('sections.services.messenger.description') ||
                      'Slack, Teams와 연동하여 팀 협업을 강화하세요'}
                  </p>
                </div>

                <div className="bg-card rounded-lg p-6 border text-center">
                  <div className="text-2xl mb-3">💳</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {safeT('sections.services.payment.title') || '결제 시스템'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {safeT('sections.services.payment.description') ||
                      'Stripe, PayPal과 연동하여 결제를 자동화하세요'}
                  </p>
                </div>

                <div className="bg-card rounded-lg p-6 border text-center">
                  <div className="text-2xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {safeT('sections.services.analytics.title') || '분석 도구'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {safeT('sections.services.analytics.description') ||
                      'Google Analytics, Mixpanel과 연동하여 심화 분석을 진행하세요'}
                  </p>
                </div>

                <div className="bg-card rounded-lg p-6 border text-center">
                  <div className="text-2xl mb-3">☁️</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {safeT('sections.services.storage.title') ||
                      '클라우드 스토리지'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {safeT('sections.services.storage.description') ||
                      'Google Drive, Dropbox와 연동하여 파일을 관리하세요'}
                  </p>
                </div>
              </div>
            </section>

            {/* 개발자 도구 */}
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {safeT('sections.developer.title') || '개발자 도구'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-3">
                    {safeT('sections.developer.sdk.title') ||
                      '🛠️ SDK & 라이브러리'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {safeT('sections.developer.sdk.description') ||
                      '다양한 프로그래밍 언어로 SureCRM을 쉽게 통합하세요'}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {safeArrayT('sections.developer.sdk.features', [
                      'JavaScript/TypeScript SDK',
                      'Python SDK',
                      'PHP SDK',
                      'REST Client 라이브러리',
                    ]).map((feature: string, index: number) => (
                      <div key={index}>
                        • {feature}
                        <br />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-3">
                    {safeT('sections.developer.testing.title') ||
                      '🧪 테스트 환경'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {safeT('sections.developer.testing.description') ||
                      '안전한 샌드박스 환경에서 연동을 테스트하세요'}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {safeArrayT('sections.developer.testing.features', [
                      '테스트 API 키',
                      '모의 데이터 환경',
                      '실시간 로그 확인',
                      '에러 디버깅 도구',
                    ]).map((feature: string, index: number) => (
                      <div key={index}>
                        • {feature}
                        <br />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 시작하기 CTA */}
            <section className="bg-muted/30 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                {safeT('sections.cta.title') || '연동을 시작해보세요'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {safeT('sections.cta.description') ||
                  'API 키를 발급받고 SureCRM과 다양한 서비스를 연동해보세요'}
              </p>
              <div className="flex justify-center gap-4">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  {safeT('sections.cta.buttons.docs') || 'API 문서 보기'}
                </button>
                <button className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors">
                  {safeT('sections.cta.buttons.guide') || '개발자 가이드'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
