import type { MetaDescriptor } from 'react-router';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  alternateLanguages?: Array<{ lang: string; url: string }>;
  noindex?: boolean;
  canonical?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * 표준화된 SEO 메타 태그를 생성합니다
 */
export function generateSEOTags(data: SEOData): MetaDescriptor[] {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    locale = 'ko_KR',
    alternateLanguages = [],
    noindex = false,
    canonical,
    author,
    publishedTime,
    modifiedTime,
  } = data;

  const metaTags: MetaDescriptor[] = [
    // 기본 메타 태그
    { title },
    { name: 'description', content: description },

    // SEO 기본
    ...(keywords ? [{ name: 'keywords', content: keywords }] : []),
    ...(author ? [{ name: 'author', content: author }] : []),

    // 로봇 제어
    ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),

    // Open Graph 태그
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:locale', content: locale },
    ...(image ? [{ property: 'og:image', content: image }] : []),
    ...(url ? [{ property: 'og:url', content: url }] : []),

    // Twitter Cards
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    ...(image ? [{ name: 'twitter:image', content: image }] : []),

    // 브랜드 정보
    { property: 'og:site_name', content: 'SureCRM' },
    { name: 'application-name', content: 'SureCRM' },

    // 게시/수정 시간
    ...(publishedTime
      ? [{ property: 'article:published_time', content: publishedTime }]
      : []),
    ...(modifiedTime
      ? [{ property: 'article:modified_time', content: modifiedTime }]
      : []),
  ];

  // Canonical URL
  if (canonical) {
    metaTags.push({
      tagName: 'link',
      rel: 'canonical',
      href: canonical,
    });
  }

  // 다국어 alternate 링크들
  alternateLanguages.forEach(({ lang, url: altUrl }) => {
    metaTags.push({
      tagName: 'link',
      rel: 'alternate',
      hrefLang: lang,
      href: altUrl,
    });
  });

  return metaTags;
}

/**
 * 구조화된 데이터 (JSON-LD) 생성
 */
export function generateStructuredData(data: {
  type:
    | 'Organization'
    | 'WebSite'
    | 'WebPage'
    | 'Article'
    | 'SoftwareApplication';
  name: string;
  description?: string;
  url?: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    availableLanguage?: string[];
  };
  sameAs?: string[];
  author?: {
    type: 'Person' | 'Organization';
    name: string;
  };
  datePublished?: string;
  dateModified?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    type: 'Offer';
    price: string;
    priceCurrency: string;
  };
}): MetaDescriptor {
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': data.type,
    name: data.name,
  };

  // 선택적 필드들 추가
  if (data.description) structuredData.description = data.description;
  if (data.url) structuredData.url = data.url;
  if (data.logo) structuredData.logo = data.logo;
  if (data.contactPoint) structuredData.contactPoint = data.contactPoint;
  if (data.sameAs) structuredData.sameAs = data.sameAs;
  if (data.author) structuredData.author = data.author;
  if (data.datePublished) structuredData.datePublished = data.datePublished;
  if (data.dateModified) structuredData.dateModified = data.dateModified;
  if (data.applicationCategory)
    structuredData.applicationCategory = data.applicationCategory;
  if (data.operatingSystem)
    structuredData.operatingSystem = data.operatingSystem;
  if (data.offers) structuredData.offers = data.offers;

  return {
    'script:ld+json': structuredData,
  };
}

/**
 * 페이지별 기본 SEO 데이터 템플릿
 */
export const seoTemplates = {
  landing: {
    title: 'SureCRM - 보험설계사를 위한 소개 네트워크 관리 솔루션',
    description:
      '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요. 보험설계사 전용 CRM 솔루션.',
    keywords: '보험설계사, CRM, 소개 네트워크, 고객 관리, 영업 관리, 보험 CRM',
    type: 'website' as const,
  },
  dashboard: {
    title: '대시보드 - SureCRM',
    description:
      'SureCRM 대시보드에서 업무 현황을 한눈에 확인하고 효율적으로 고객을 관리하세요.',
    keywords: '대시보드, 업무현황, 고객관리, CRM',
    noindex: true, // 로그인 필요한 페이지
  },
  clients: {
    title: '고객 관리 - SureCRM',
    description:
      '고객 정보를 체계적으로 관리하고 영업 파이프라인을 통해 효율적인 고객 관계를 구축하세요.',
    keywords: '고객관리, 고객정보, 영업파이프라인, CRM',
    noindex: true,
  },
  features: {
    title: '기능 소개 - SureCRM',
    description:
      'SureCRM의 강력한 기능들을 확인해보세요. 보험설계사를 위한 완벽한 CRM 솔루션을 제공합니다.',
    keywords: '기능소개, CRM기능, 보험설계사, 솔루션',
    type: 'website' as const,
  },
  pricing: {
    title: '요금제 - SureCRM',
    description:
      'SureCRM Pro 요금제를 확인하고 14일 무료 체험을 시작하세요. 보험설계사를 위한 전문 CRM 솔루션.',
    keywords: '요금제, 가격, 무료체험, CRM요금',
    type: 'website' as const,
  },
  contact: {
    title: '문의하기 - SureCRM',
    description:
      'SureCRM에 대한 문의사항을 남겨주세요. 빠른 시일 내에 답변드리겠습니다.',
    keywords: '문의하기, 고객지원, 연락처',
    type: 'website' as const,
  },
  help: {
    title: '도움말 - SureCRM',
    description:
      'SureCRM 사용법과 자주 묻는 질문을 확인하세요. 고객 지원팀이 도움을 드립니다.',
    keywords: '도움말, 사용법, FAQ, 고객지원',
    type: 'website' as const,
  },
};

/**
 * 언어별 메타 데이터 생성
 */
export function getLocalizedSEO(
  template: keyof typeof seoTemplates,
  lang: 'ko' | 'en' | 'ja',
  baseUrl: string
): SEOData {
  const base = seoTemplates[template];

  // 언어별 번역 (간단한 예시 - 실제로는 i18n 시스템 활용)
  const translations = {
    ko: base,
    en: {
      ...base,
      title: base.title
        .replace('SureCRM', 'SureCRM')
        .replace(/한국어 제목/, 'English Title'),
      description: base.description.replace(
        /한국어 설명/,
        'English Description'
      ),
    },
    ja: {
      ...base,
      title: base.title
        .replace('SureCRM', 'SureCRM')
        .replace(/한국어 제목/, '日本語タイトル'),
      description: base.description.replace(/한국어 설명/, '日本語の説明'),
    },
  };

  const localized = translations[lang];
  const currentPath = template === 'landing' ? '/' : `/${template}`;
  const currentUrl =
    lang === 'ko'
      ? `${baseUrl}${currentPath}`
      : `${baseUrl}/${lang}${currentPath}`;

  return {
    ...localized,
    url: currentUrl,
    locale: lang === 'ko' ? 'ko_KR' : lang === 'en' ? 'en_US' : 'ja_JP',
    canonical: currentUrl,
    alternateLanguages: [
      { lang: 'ko', url: `${baseUrl}${currentPath}` },
      { lang: 'en', url: `${baseUrl}/en${currentPath}` },
      { lang: 'ja', url: `${baseUrl}/ja${currentPath}` },
    ],
  };
}
