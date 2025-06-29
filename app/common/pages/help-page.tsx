import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { LandingLayout } from '~/common/layouts/landing-layout';

export default function HelpPage() {
  const { t, ready } = useTranslation('help');
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
  const safeArrayT = (
    key: string,
    fallback: Array<{ title: string; description: string }>
  ) => {
    if (!isHydrated || !ready) return fallback;
    const result = t(key, { returnObjects: true });
    return Array.isArray(result) ? result : fallback;
  };

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            {safeT('title') || '도움말'}
          </h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            {safeT('subtitle') ||
              'SureCRM 사용법과 자주 묻는 질문을 확인하세요'}
          </p>

          <div className="space-y-12">
            {/* 시작하기 섹션 */}
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {safeT('sections.getting_started.title') || '시작하기'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {safeArrayT('sections.getting_started.items', [
                  {
                    title: '회원가입하기',
                    description:
                      'SureCRM 계정을 생성하고 14일 무료 체험을 시작하세요',
                  },
                  {
                    title: '고객 정보 등록',
                    description:
                      '첫 번째 고객을 등록하고 CRM 시스템을 설정하세요',
                  },
                  {
                    title: '파이프라인 설정',
                    description: '영업 프로세스에 맞는 파이프라인을 구성하세요',
                  },
                ]).map((item, index) => (
                  <div key={index} className="bg-card rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 지원 문의 */}
            <section className="bg-muted/30 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                {safeT('contact_support.title') || '추가 도움이 필요하신가요?'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {safeT('contact_support.description') ||
                  '문제를 해결할 수 없다면 고객 지원팀에 문의해주세요'}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                {safeT('contact_support.button') || '지원팀 문의하기'}
              </Link>
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
