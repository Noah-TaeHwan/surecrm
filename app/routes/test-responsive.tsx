import { 
  ResponsiveContainer, 
  ResponsiveGrid, 
  ResponsiveStack, 
  ResponsiveFlex, 
  ResponsiveSection,
  validateAccessibility,
  logAccessibilityResults,
  createAriaAttributes,
  generateAccessibleId,
  FocusManager,
  type AccessibilityValidationResult
} from "~/common/components/ui";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { useEffect, useRef, useState } from "react";

export function meta() {
  return [
    { title: "반응형 컴포넌트 테스트 - SureCRM" },
    { name: "description", content: "SureCRM 반응형 레이아웃 컴포넌트들의 테스트 페이지입니다." }
  ];
}

export default function TestResponsive() {
  const [accessibilityResults, setAccessibilityResults] = useState<Record<string, AccessibilityValidationResult>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 접근성 검증 실행
  useEffect(() => {
    if (containerRef.current) {
      const testSections = containerRef.current.querySelectorAll('[data-test-section]');
      const results: Record<string, AccessibilityValidationResult> = {};

      testSections.forEach((section) => {
        const sectionName = section.getAttribute('data-test-section') || 'unknown';
        const result = validateAccessibility(section as HTMLElement, {});
        results[sectionName] = result;
        
        // 개발 환경에서 콘솔에 결과 출력
        logAccessibilityResults(`${sectionName} 섹션`, result);
      });

      setAccessibilityResults(results);
    }
  }, []);

  // 접근성 점수 계산
  const getAccessibilityScore = (result: AccessibilityValidationResult): number => {
    const totalIssues = result.errors.length + result.warnings.length;
    const errorWeight = 10;
    const warningWeight = 5;
    const penalty = (result.errors.length * errorWeight) + (result.warnings.length * warningWeight);
    return Math.max(0, 100 - penalty);
  };

  // 접근성 배지 색상 결정
  const getAccessibilityBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return "default"; // 녹색
    if (score >= 70) return "secondary"; // 노란색
    return "destructive"; // 빨간색
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-4">
      <ResponsiveContainer size="2xl" padding="xl">
        {/* 페이지 헤더 */}
        <ResponsiveSection 
          as="header"
          padding="xl" 
          background="white" 
          rounded="lg" 
          shadow="sm" 
          className="mb-8"
          data-test-section="page-header"
          aria-labelledby="page-title"
        >
          <h1 id="page-title" className="text-3xl font-bold text-gray-900 mb-2">
            반응형 컴포넌트 테스트
          </h1>
          <p className="text-gray-600 mb-4">
            SureCRM의 반응형 레이아웃 컴포넌트들과 접근성 검증 기능을 테스트합니다.
          </p>
          
          {/* 접근성 검증 결과 요약 */}
          <ResponsiveFlex wrap="wrap" gap="sm" className="mt-4">
            {Object.entries(accessibilityResults).map(([sectionName, result]) => {
              const score = getAccessibilityScore(result);
              return (
                <Badge 
                  key={sectionName}
                  variant={getAccessibilityBadgeVariant(score)}
                  className="text-xs"
                >
                  {sectionName}: {score}점
                </Badge>
              );
            })}
          </ResponsiveFlex>
        </ResponsiveSection>

        {/* 1. ResponsiveContainer 테스트 */}
        <ResponsiveSection 
          padding="lg" 
          background="white" 
          rounded="lg" 
          shadow="sm" 
          className="mb-8"
          data-test-section="responsive-container"
          aria-labelledby="container-title"
        >
          <h2 id="container-title" className="text-2xl font-semibold mb-4">1. ResponsiveContainer</h2>
          
                      <ResponsiveStack gap="lg">
            <div>
              <h3 className="text-lg font-medium mb-2">기본 컨테이너</h3>
              <ResponsiveContainer 
                size="md" 
                padding="md" 
                className="bg-blue-50 border border-blue-200 rounded"
                role="region"
                aria-label="기본 컨테이너 예시"
              >
                <p>최대 너비 md, 패딩 md인 컨테이너입니다.</p>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">큰 컨테이너</h3>
              <ResponsiveContainer 
                size="lg" 
                padding="lg"
                className="bg-green-50 border border-green-200 rounded"
                role="region"
                aria-label="큰 컨테이너 예시"
              >
                <p>큰 크기의 컨테이너입니다.</p>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">중앙 정렬 컨테이너</h3>
              <ResponsiveContainer 
                size="xl" 
                padding="xl"
                center
                className="bg-purple-50 border border-purple-200 rounded min-h-32"
                role="region"
                aria-label="중앙 정렬 컨테이너 예시"
              >
                <p className="text-center">중앙 정렬된 컨텐츠</p>
              </ResponsiveContainer>
            </div>
          </ResponsiveStack>
        </ResponsiveSection>

        {/* 2. ResponsiveGrid 테스트 */}
        <ResponsiveSection 
          padding="lg" 
          background="white" 
          rounded="lg" 
          shadow="sm" 
          className="mb-8"
          data-test-section="responsive-grid"
          aria-labelledby="grid-title"
        >
          <h2 id="grid-title" className="text-2xl font-semibold mb-4">2. ResponsiveGrid</h2>
          
          <ResponsiveStack gap="xl">
            <div>
              <h3 className="text-lg font-medium mb-2">기본 그리드 (3열)</h3>
              <ResponsiveGrid 
                cols={3} 
                gap="md"
                role="grid"
                aria-label="3열 그리드 예시"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Card key={num} role="gridcell">
                    <CardContent className="p-4">
                      <p>아이템 {num}</p>
                    </CardContent>
                  </Card>
                ))}
              </ResponsiveGrid>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">반응형 그리드</h3>
              <ResponsiveGrid 
                cols={1}
                sm={{ cols: 1 }}
                md={{ cols: 2 }}
                lg={{ cols: 4 }}
                gap="sm"
                role="grid"
                aria-label="반응형 그리드 예시"
              >
                {[1, 2, 3, 4].map((num) => (
                  <Card key={num} role="gridcell">
                    <CardContent className="p-4">
                      <p>반응형 아이템 {num}</p>
                    </CardContent>
                  </Card>
                ))}
              </ResponsiveGrid>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Auto-fit 그리드</h3>
              <ResponsiveGrid 
                autoFit 
                minItemWidth="200px" 
                gap="md"
                role="grid"
                aria-label="Auto-fit 그리드 예시"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <Card key={num} role="gridcell">
                    <CardContent className="p-4">
                      <p>Auto-fit 아이템 {num}</p>
                    </CardContent>
                  </Card>
                ))}
              </ResponsiveGrid>
            </div>
          </ResponsiveStack>
        </ResponsiveSection>

        {/* 3. ResponsiveStack 테스트 */}
        <ResponsiveSection 
          padding="lg" 
          background="white" 
          rounded="lg" 
          shadow="sm" 
          className="mb-8"
          data-test-section="responsive-stack"
          aria-labelledby="stack-title"
        >
          <h2 id="stack-title" className="text-2xl font-semibold mb-4">3. ResponsiveStack</h2>
          
          <ResponsiveStack gap="xl">
            <div>
              <h3 className="text-lg font-medium mb-2">세로 스택 (기본)</h3>
              <ResponsiveStack 
                gap="md" 
                className="p-4 bg-gray-50 rounded"
                role="group"
                aria-label="세로 스택 예시"
              >
                <Button>버튼 1</Button>
                <Button variant="outline">버튼 2</Button>
                <Button variant="secondary">버튼 3</Button>
              </ResponsiveStack>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">가로 스택</h3>
              <ResponsiveStack 
                direction="row" 
                gap="md" 
                className="p-4 bg-gray-50 rounded"
                role="group"
                aria-label="가로 스택 예시"
              >
                <Button>버튼 1</Button>
                <Button variant="outline">버튼 2</Button>
                <Button variant="secondary">버튼 3</Button>
              </ResponsiveStack>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">반응형 방향</h3>
              <ResponsiveStack 
                direction="column" 
                gap="md" 
                className="p-4 bg-gray-50 rounded sm:flex-row"
                role="group"
                aria-label="반응형 방향 스택 예시"
              >
                <Button>모바일: 세로</Button>
                <Button variant="outline">데스크톱: 가로</Button>
                <Button variant="secondary">정렬</Button>
              </ResponsiveStack>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">중앙 정렬 + 래핑</h3>
              <ResponsiveStack 
                direction="row" 
                align="center" 
                justify="center" 
                wrap={true}
                gap="sm" 
                className="p-4 bg-gray-50 rounded"
                role="group"
                aria-label="래핑 스택 예시"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <Badge key={num} variant="outline">태그 {num}</Badge>
                ))}
              </ResponsiveStack>
            </div>
          </ResponsiveStack>
        </ResponsiveSection>

        {/* 4. ResponsiveFlex 테스트 */}
        <ResponsiveSection 
          padding="lg" 
          background="white" 
          rounded="lg" 
          shadow="sm" 
          className="mb-8"
          data-test-section="responsive-flex"
          aria-labelledby="flex-title"
        >
          <h2 id="flex-title" className="text-2xl font-semibold mb-4">4. ResponsiveFlex</h2>
          
          <ResponsiveStack gap="lg">
            <div>
              <h3 className="text-lg font-medium mb-2">기본 플렉스 레이아웃</h3>
              <ResponsiveFlex 
                direction="row"
                wrap="wrap" 
                gap="md"
                className="p-4 bg-gray-50 rounded"
                role="group"
                aria-label="기본 Flex 예시"
              >
                <span>왼쪽 컨텐츠</span>
                <Button>오른쪽 버튼</Button>
              </ResponsiveFlex>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">반응형 방향 변경</h3>
              <ResponsiveFlex 
                direction="row"
                justify="between" 
                align="center"
                className="p-4 bg-gray-50 rounded"
                role="group"
                aria-label="정렬된 Flex 예시"
              >
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <p>카드 1</p>
                  </CardContent>
                </Card>
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <p>카드 2</p>
                  </CardContent>
                </Card>
              </ResponsiveFlex>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Grow/Shrink 테스트</h3>
              <ResponsiveFlex gap="md" className="p-4 bg-gray-50 rounded" role="group" aria-label="Grow/Shrink 테스트 예시">
                <div className="bg-blue-100 p-2 rounded flex-shrink-0">고정 너비</div>
                <div className="bg-green-100 p-2 rounded flex-grow">확장 가능</div>
                <div className="bg-red-100 p-2 rounded flex-shrink-0">고정 너비</div>
              </ResponsiveFlex>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">래핑 + 정렬</h3>
              <ResponsiveFlex 
                direction="row"
                wrap="wrap" 
                gap="md"
                className="p-4 bg-gray-50 rounded"
                role="group"
                aria-label="기본 Flex 예시"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Badge key={num} variant="secondary">아이템 {num}</Badge>
                ))}
              </ResponsiveFlex>
            </div>
          </ResponsiveStack>
        </ResponsiveSection>

        {/* 5. ResponsiveSection 테스트 */}
        <ResponsiveSection 
          padding="lg" 
          background="white" 
          rounded="lg" 
          shadow="sm" 
          className="mb-8"
          data-test-section="responsive-section"
          aria-labelledby="section-title"
        >
          <h2 id="section-title" className="text-2xl font-semibold mb-4">5. ResponsiveSection</h2>
          
          <ResponsiveStack gap="xl">
            <div>
              <h3 className="text-lg font-medium mb-2">기본 섹션</h3>
              <ResponsiveSection 
                padding="md" 
                background="gray" 
                rounded="md"
                role="region"
                aria-label="기본 섹션 예시"
              >
                <p>기본 패딩과 배경을 가진 섹션입니다.</p>
              </ResponsiveSection>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">반응형 섹션</h3>
              <ResponsiveSection 
                padding="sm"
                sm={{ padding: 'md' }}
                lg={{ padding: 'lg' }}
                background="primary" 
                rounded="lg"
                role="region"
                aria-label="반응형 섹션 예시"
              >
                <p>반응형 패딩을 가진 섹션입니다.</p>
              </ResponsiveSection>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">최대 너비 + 중앙 정렬</h3>
              <ResponsiveSection 
                maxWidth="md"
                centerContent
                padding="lg"
                background="gray" 
                rounded="xl"
                shadow="md"
                role="region"
                aria-label="최대 너비 중앙 정렬 섹션 예시"
              >
                <p className="text-center">최대 너비가 제한되고 중앙 정렬된 섹션입니다.</p>
              </ResponsiveSection>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">최소 높이</h3>
              <ResponsiveSection 
                minHeight="quarter"
                padding="md"
                background="gray" 
                rounded="lg"
                border="thin"
                className="flex items-center justify-center"
                role="region"
                aria-label="최소 높이 섹션 예시"
              >
                <p>최소 높이가 설정된 섹션입니다.</p>
              </ResponsiveSection>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">시맨틱 HTML</h3>
              <ResponsiveSection 
                as="article"
                padding="md"
                background="gray" 
                rounded="md"
                role="article"
                aria-labelledby="article-title"
              >
                <h4 id="article-title" className="font-semibold mb-2">기사 제목</h4>
                <p>article 태그로 렌더링되는 시맨틱 섹션입니다.</p>
              </ResponsiveSection>
            </div>
          </ResponsiveStack>
        </ResponsiveSection>

        {/* 6. 접근성 검증 결과 */}
        <ResponsiveSection 
          padding="lg" 
          background="white" 
          rounded="lg" 
          shadow="sm" 
          className="mb-8"
          data-test-section="accessibility-results"
          aria-labelledby="accessibility-title"
        >
          <h2 id="accessibility-title" className="text-2xl font-semibold mb-4">6. 접근성 검증 결과</h2>
          
          <ResponsiveGrid cols={1} sm={{ cols: 2 }} lg={{ cols: 3 }} gap="lg">
            {Object.entries(accessibilityResults).map(([sectionName, result]) => {
              const score = getAccessibilityScore(result);
              return (
                <Card key={sectionName}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {sectionName}
                      <Badge variant={getAccessibilityBadgeVariant(score)}>
                        {score}점
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveStack gap="sm">
                      <div className="text-sm">
                        <span className="font-medium text-red-600">오류: </span>
                        {result.errors.length}개
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-yellow-600">경고: </span>
                        {result.warnings.length}개
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-blue-600">제안: </span>
                        {result.suggestions.length}개
                      </div>
                      {result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-red-600 mb-1">주요 오류:</p>
                          <ul className="text-xs text-red-500 space-y-1">
                            {result.errors.slice(0, 2).map((error, index) => (
                              <li key={index}>• {error.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </ResponsiveStack>
                  </CardContent>
                </Card>
              );
            })}
          </ResponsiveGrid>
        </ResponsiveSection>

        {/* 7. 키보드 네비게이션 테스트 */}
        <ResponsiveSection 
          padding="lg" 
          background="white" 
          rounded="lg" 
          shadow="sm"
          data-test-section="keyboard-navigation"
          aria-labelledby="keyboard-title"
        >
          <h2 id="keyboard-title" className="text-2xl font-semibold mb-4">7. 키보드 네비게이션 테스트</h2>
          <p className="text-gray-600 mb-4">Tab 키를 사용하여 아래 요소들을 순서대로 탐색해보세요.</p>
          
          <ResponsiveFlex direction="row" wrap="wrap" gap="md">
            <Button 
              onClick={() => alert('버튼 1 클릭됨')}
              aria-describedby="button1-desc"
            >
              포커스 가능한 버튼 1
            </Button>
            <span id="button1-desc" className="sr-only">첫 번째 테스트 버튼입니다</span>
            
            <Button 
              variant="outline"
              onClick={() => alert('버튼 2 클릭됨')}
              aria-describedby="button2-desc"
            >
              포커스 가능한 버튼 2
            </Button>
            <span id="button2-desc" className="sr-only">두 번째 테스트 버튼입니다</span>
            
            <Button 
              variant="secondary"
              onClick={() => {
                if (containerRef.current) {
                  FocusManager.focusFirst(containerRef.current);
                }
              }}
              aria-describedby="button3-desc"
            >
              첫 번째 요소로 포커스 이동
            </Button>
            <span id="button3-desc" className="sr-only">페이지의 첫 번째 포커스 가능한 요소로 이동합니다</span>
          </ResponsiveFlex>
        </ResponsiveSection>
      </ResponsiveContainer>
    </div>
  );
} 