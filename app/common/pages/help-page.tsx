import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { LandingLayout } from '~/common/layouts/landing-layout';
import { createServerTranslator } from '~/lib/i18n/language-manager.server';

// 직접 타입 정의
interface LoaderArgs {
  request: Request;
}

interface MetaArgs {
  data?: {
    meta?: {
      title: string;
      description: string;
    };
  };
}

// Loader function
export async function loader({ request }: LoaderArgs) {
  // 🌍 서버에서 다국어 번역 로드
  try {
    const { t } = await createServerTranslator(request, 'help');

    return {
      // 🌍 meta용 번역 데이터
      meta: {
        title: t('meta.title', '도움말') + ' | SureCRM',
        description: t(
          'meta.description',
          'SureCRM 사용법과 자주 묻는 질문을 확인하세요. 고객 지원팀이 도움을 드립니다.'
        ),
      },
    };
  } catch (error) {
    console.error('Help page loader 에러:', error);

    // 에러 시 한국어 기본값
    return {
      meta: {
        title: '도움말 | SureCRM',
        description:
          'SureCRM 사용법과 자주 묻는 질문을 확인하세요. 고객 지원팀이 도움을 드립니다.',
      },
    };
  }
}

// 🌍 전문 SEO 메타 정보 - FAQ + 사용법 최적화
export function meta({ data }: MetaArgs) {
  const meta = data?.meta || {
    title: '도움말 | SureCRM',
    description:
      'SureCRM 사용법과 자주 묻는 질문을 확인하세요. 고객 지원팀이 도움을 드립니다.',
  };

  const url = 'https://surecrm.pro/help';

  return [
    // 🎯 기본 SEO 태그들 - 지원/사용법 최적화
    { title: meta.title },
    { name: 'description', content: meta.description },
    {
      name: 'keywords',
      content:
        'SureCRM 도움말, 사용법, FAQ, 자주묻는질문, 고객지원, 보험설계사 CRM 가이드, 튜토리얼, 사용자 메뉴얼',
    },
    { name: 'author', content: 'SureCRM Support Team' },
    { name: 'robots', content: 'index, follow' },

    // 🌐 Open Graph
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.description },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: 'SureCRM' },
    { property: 'og:image', content: 'https://surecrm.pro/og-help.png' },
    { property: 'article:section', content: 'Support' },
    { property: 'article:tag', content: 'help,faq,tutorial,guide' },

    // 🐦 Twitter Cards
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: meta.title },
    { name: 'twitter:description', content: meta.description },
    { name: 'twitter:image', content: 'https://surecrm.pro/og-help.png' },

    // 🔗 Canonical URL
    { tagName: 'link', rel: 'canonical', href: url },

    // 🌍 다국어 대체 링크들
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'ko',
      href: 'https://surecrm.pro/help',
    },
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'en',
      href: 'https://surecrm.pro/en/help',
    },
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'ja',
      href: 'https://surecrm.pro/ja/help',
    },
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'x-default',
      href: 'https://surecrm.pro/help',
    },

    // 🆘 FAQ Schema - 자주 묻는 질문
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        name: meta.title,
        description: meta.description,
        url: url,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'SureCRM은 어떤 서비스인가요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'SureCRM은 보험설계사를 위한 전문 CRM 솔루션입니다. 고객 관계 관리, 소개 네트워크 추적, 영업 파이프라인 관리 등의 기능을 제공합니다.',
            },
          },
          {
            '@type': 'Question',
            name: '무료 체험 기간은 얼마나 되나요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '14일 동안 모든 기능을 무료로 체험할 수 있습니다. 신용카드 등록 없이도 시작할 수 있습니다.',
            },
          },
          {
            '@type': 'Question',
            name: '어떤 언어를 지원하나요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '한국어, 영어, 일본어를 지원합니다. 언어 설정에서 원하는 언어로 변경할 수 있습니다.',
            },
          },
          {
            '@type': 'Question',
            name: '고객 지원은 어떻게 받을 수 있나요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '이메일(noah@surecrm.pro)을 통해 문의하실 수 있습니다. 평일 9시-18시에 답변드립니다.',
            },
          },
          {
            '@type': 'Question',
            name: '데이터는 안전하게 보관되나요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '네, 모든 데이터는 암호화되어 안전하게 보관되며, 개인정보보호법을 준수합니다. 정기적인 백업으로 데이터 손실을 방지합니다.',
            },
          },
        ],
      },
    },

    // 📚 HowTo Schema - 시작하기 가이드
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'SureCRM 시작하기 가이드',
        description: 'SureCRM을 처음 사용하는 보험설계사를 위한 단계별 가이드',
        image: 'https://surecrm.pro/images/tutorial-guide.png',
        totalTime: 'PT15M',
        estimatedCost: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: '0',
        },
        supply: [
          {
            '@type': 'HowToSupply',
            name: '인터넷 연결',
          },
          {
            '@type': 'HowToSupply',
            name: '웹 브라우저',
          },
        ],
        step: [
          {
            '@type': 'HowToStep',
            name: '계정 생성',
            text: 'SureCRM 계정을 생성하고 14일 무료 체험을 시작하세요',
            url: 'https://surecrm.pro/auth/signup',
            image: 'https://surecrm.pro/images/step1-signup.png',
          },
          {
            '@type': 'HowToStep',
            name: '고객 정보 등록',
            text: '첫 번째 고객을 등록하고 CRM 시스템을 설정하세요',
            url: 'https://surecrm.pro/clients',
            image: 'https://surecrm.pro/images/step2-clients.png',
          },
          {
            '@type': 'HowToStep',
            name: '파이프라인 설정',
            text: '영업 프로세스에 맞는 파이프라인을 구성하세요',
            url: 'https://surecrm.pro/pipeline',
            image: 'https://surecrm.pro/images/step3-pipeline.png',
          },
        ],
      },
    },

    // 📄 Help Page Schema
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        description: meta.description,
        url: url,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: '홈',
              item: 'https://surecrm.pro',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: '도움말',
              item: url,
            },
          ],
        },
        mainEntity: {
          '@type': 'TechArticle',
          headline: meta.title,
          description: meta.description,
          author: {
            '@type': 'Organization',
            name: 'SureCRM Support Team',
          },
          publisher: {
            '@type': 'Organization',
            name: 'SureCRM',
            logo: {
              '@type': 'ImageObject',
              url: 'https://surecrm.pro/logo-192.png',
            },
          },
          dateModified: new Date().toISOString(),
          inLanguage: 'ko-KR',
          audience: {
            '@type': 'BusinessAudience',
            audienceType: 'Insurance Agents',
          },
        },
      },
    },
  ];
}

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
