/**
 * SEO 설정 검증을 위한 헬퍼 함수들
 * 개발 환경에서 SEO 태그가 올바르게 설정되었는지 확인
 */

export interface SEOValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

/**
 * 메타 태그 유효성 검사
 */
export function validateMetaTags(metaTags: Array<any>): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 필수 태그 확인
  const titleTag = metaTags.find(tag => tag.title);
  if (!titleTag) {
    errors.push('Title 태그가 없습니다.');
    score -= 20;
  } else if (titleTag.title.length > 60) {
    warnings.push('Title이 60자를 초과합니다. 검색 결과에서 잘릴 수 있습니다.');
    score -= 5;
  }

  const descriptionTag = metaTags.find(tag => tag.name === 'description');
  if (!descriptionTag) {
    errors.push('Description 메타 태그가 없습니다.');
    score -= 20;
  } else if (descriptionTag.content.length > 160) {
    warnings.push(
      'Description이 160자를 초과합니다. 검색 결과에서 잘릴 수 있습니다.'
    );
    score -= 5;
  }

  // Open Graph 태그 확인
  const ogTitle = metaTags.find(tag => tag.property === 'og:title');
  const ogDescription = metaTags.find(tag => tag.property === 'og:description');
  const ogType = metaTags.find(tag => tag.property === 'og:type');

  if (!ogTitle) {
    warnings.push('og:title 태그가 없습니다.');
    score -= 5;
  }
  if (!ogDescription) {
    warnings.push('og:description 태그가 없습니다.');
    score -= 5;
  }
  if (!ogType) {
    warnings.push('og:type 태그가 없습니다.');
    score -= 5;
  }

  // Twitter Cards 확인
  const twitterCard = metaTags.find(tag => tag.name === 'twitter:card');
  if (!twitterCard) {
    warnings.push('Twitter Card 태그가 없습니다.');
    score -= 5;
  }

  // Canonical URL 확인
  const canonicalTag = metaTags.find(
    tag => tag.tagName === 'link' && tag.rel === 'canonical'
  );
  if (!canonicalTag) {
    warnings.push('Canonical URL이 설정되지 않았습니다.');
    score -= 5;
  }

  // 구조화된 데이터 확인
  const structuredData = metaTags.find(tag => tag['script:ld+json']);
  if (!structuredData) {
    warnings.push('구조화된 데이터(JSON-LD)가 없습니다.');
    score -= 10;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * SEO 점수 계산 및 리포트 생성
 */
export function generateSEOReport(metaTags: Array<any>, url: string): string {
  const validation = validateMetaTags(metaTags);

  let report = `\n🔍 SEO 검증 리포트 - ${url}\n`;
  report += `${'='.repeat(50)}\n`;
  report += `SEO 점수: ${validation.score}/100\n\n`;

  if (validation.errors.length > 0) {
    report += `❌ 오류 (${validation.errors.length}개):\n`;
    validation.errors.forEach((error, index) => {
      report += `  ${index + 1}. ${error}\n`;
    });
    report += `\n`;
  }

  if (validation.warnings.length > 0) {
    report += `⚠️  경고 (${validation.warnings.length}개):\n`;
    validation.warnings.forEach((warning, index) => {
      report += `  ${index + 1}. ${warning}\n`;
    });
    report += `\n`;
  }

  if (validation.isValid && validation.warnings.length === 0) {
    report += `✅ 모든 SEO 검증 통과!\n`;
  }

  // 개선 제안
  report += `💡 개선 제안:\n`;
  if (validation.score < 90) {
    report += `  - 누락된 메타 태그들을 추가하세요\n`;
  }
  if (validation.score < 70) {
    report += `  - 구조화된 데이터를 추가하여 검색 엔진 이해도를 높이세요\n`;
  }
  if (validation.score < 50) {
    report += `  - 기본적인 SEO 태그들(title, description)부터 설정하세요\n`;
  }

  return report;
}

/**
 * 개발 환경에서 SEO 검증 실행
 */
export function runSEOValidation(metaTags: Array<any>, url: string) {
  if (process.env.NODE_ENV === 'development') {
    const report = generateSEOReport(metaTags, url);
    console.log(report);
  }
}

/**
 * 리디렉션 체인 검사
 */
export function validateRedirectChain(
  redirects: Array<{ from: string; to: string; status: number }>
) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 리디렉션 루프 검사
  for (const redirect of redirects) {
    if (redirect.from === redirect.to) {
      errors.push(`리디렉션 루프 발견: ${redirect.from} -> ${redirect.to}`);
    }
  }

  // 리디렉션 체인 길이 검사 (3개 이상은 권장하지 않음)
  const chains = findRedirectChains(redirects);
  for (const chain of chains) {
    if (chain.length > 3) {
      warnings.push(
        `긴 리디렉션 체인 발견 (${chain.length}단계): ${chain.join(' -> ')}`
      );
    }
  }

  // 잘못된 HTTP 상태 코드 검사
  for (const redirect of redirects) {
    if (![301, 302, 303, 307, 308].includes(redirect.status)) {
      errors.push(
        `잘못된 리디렉션 상태 코드: ${redirect.status} (${redirect.from})`
      );
    }
  }

  return { errors, warnings };
}

function findRedirectChains(
  redirects: Array<{ from: string; to: string; status: number }>
): string[][] {
  const chains: string[][] = [];
  const visited = new Set<string>();

  for (const redirect of redirects) {
    if (visited.has(redirect.from)) continue;

    const chain = [redirect.from];
    let current = redirect.to;
    visited.add(redirect.from);

    while (current) {
      const nextRedirect = redirects.find(r => r.from === current);
      if (nextRedirect && !chain.includes(nextRedirect.to)) {
        chain.push(current);
        current = nextRedirect.to;
      } else {
        chain.push(current);
        break;
      }
    }

    if (chain.length > 1) {
      chains.push(chain);
    }
  }

  return chains;
}
