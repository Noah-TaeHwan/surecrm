import type { Route } from './+types/sitemap[.]xml';

// 사이트맵에 포함할 정적 페이지들
const staticPages = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/features', priority: 0.8, changefreq: 'weekly' },
  { path: '/pricing', priority: 0.8, changefreq: 'weekly' },
  { path: '/contact', priority: 0.7, changefreq: 'monthly' },
  { path: '/help', priority: 0.6, changefreq: 'monthly' },
  { path: '/terms', priority: 0.3, changefreq: 'yearly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
];

// 지원하는 언어 코드
const supportedLanguages = ['ko', 'en', 'ja'];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // XML 시작
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // 정적 페이지들 추가 (다국어 지원)
  for (const page of staticPages) {
    // 기본 언어 (한국어) 페이지
    sitemap += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;

    // 다국어 alternate 링크들 추가
    for (const lang of supportedLanguages) {
      const langPath = lang === 'ko' ? page.path : `/${lang}${page.path}`;
      sitemap += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${langPath}" />`;
    }

    sitemap += `
  </url>`;

    // 영어, 일본어 버전도 별도 URL로 추가
    for (const lang of supportedLanguages) {
      if (lang !== 'ko') {
        const langPath = `/${lang}${page.path}`;
        sitemap += `
  <url>
    <loc>${baseUrl}${langPath}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority * 0.9}</priority>`;

        // 다국어 alternate 링크들 추가
        for (const altLang of supportedLanguages) {
          const altPath =
            altLang === 'ko' ? page.path : `/${altLang}${page.path}`;
          sitemap += `
    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}${altPath}" />`;
        }

        sitemap += `
  </url>`;
      }
    }
  }

  // XML 종료
  sitemap += `
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // 1시간 캐시
      'X-Robots-Tag': 'noindex', // 사이트맵 자체는 인덱싱하지 않음
    },
  });
}
