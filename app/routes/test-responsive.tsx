import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '~/common/components/ui';

export function meta() {
  return [
    { title: "반응형 컨테이너 테스트 - SureCRM" },
    { name: "description", content: "ResponsiveContainer 컴포넌트 테스트 페이지" }
  ];
}

export default function TestResponsivePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="space-y-12">
        {/* 크기별 컨테이너 테스트 */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            ResponsiveContainer 테스트
          </h1>
          
          {/* XS 컨테이너 */}
          <ResponsiveContainer 
            size="xs" 
            padding="md" 
            center 
            className="bg-blue-100 border-2 border-blue-300 rounded-lg"
            aria-label="Extra Small 컨테이너 예제"
          >
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">XS 컨테이너</h2>
              <p className="text-blue-600">max-width: 320px (xs)</p>
              <p className="text-sm text-blue-500 mt-2">패딩: 반응형 medium</p>
            </div>
          </ResponsiveContainer>

          {/* SM 컨테이너 */}
          <ResponsiveContainer 
            size="sm" 
            padding="lg" 
            center 
            className="bg-green-100 border-2 border-green-300 rounded-lg"
            aria-label="Small 컨테이너 예제"
          >
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold text-green-800 mb-2">SM 컨테이너</h2>
              <p className="text-green-600">max-width: 384px (sm)</p>
              <p className="text-sm text-green-500 mt-2">패딩: 반응형 large</p>
            </div>
          </ResponsiveContainer>

          {/* MD 컨테이너 */}
          <ResponsiveContainer 
            size="md" 
            padding="md" 
            center 
            className="bg-yellow-100 border-2 border-yellow-300 rounded-lg"
            aria-label="Medium 컨테이너 예제"
          >
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">MD 컨테이너</h2>
              <p className="text-yellow-600">max-width: 448px (md)</p>
              <p className="text-sm text-yellow-500 mt-2">패딩: 반응형 medium</p>
            </div>
          </ResponsiveContainer>

          {/* LG 컨테이너 (기본값) */}
          <ResponsiveContainer 
            center 
            className="bg-purple-100 border-2 border-purple-300 rounded-lg"
            aria-label="Large 컨테이너 예제 (기본값)"
          >
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">LG 컨테이너 (기본값)</h2>
              <p className="text-purple-600">max-width: 896px (4xl)</p>
              <p className="text-sm text-purple-500 mt-2">패딩: 반응형 medium (기본값)</p>
            </div>
          </ResponsiveContainer>

          {/* XL 컨테이너 */}
          <ResponsiveContainer 
            size="xl" 
            padding="xl" 
            center 
            className="bg-red-100 border-2 border-red-300 rounded-lg"
            aria-label="Extra Large 컨테이너 예제"
          >
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold text-red-800 mb-2">XL 컨테이너</h2>
              <p className="text-red-600">max-width: 1152px (6xl)</p>
              <p className="text-sm text-red-500 mt-2">패딩: 반응형 extra large</p>
            </div>
          </ResponsiveContainer>

          {/* 2XL 컨테이너 */}
          <ResponsiveContainer 
            size="2xl" 
            padding="sm" 
            center 
            className="bg-indigo-100 border-2 border-indigo-300 rounded-lg"
            aria-label="2X Large 컨테이너 예제"
          >
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold text-indigo-800 mb-2">2XL 컨테이너</h2>
              <p className="text-indigo-600">max-width: 1280px (7xl)</p>
              <p className="text-sm text-indigo-500 mt-2">패딩: 반응형 small</p>
            </div>
          </ResponsiveContainer>

          {/* FULL 컨테이너 */}
          <ResponsiveContainer 
            size="full" 
            padding="none" 
            className="bg-gray-100 border-2 border-gray-300 rounded-lg"
            aria-label="Full Width 컨테이너 예제"
          >
            <div className="py-8 text-center px-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">FULL 컨테이너</h2>
              <p className="text-gray-600">max-width: 100% (full)</p>
              <p className="text-sm text-gray-500 mt-2">패딩: 없음 (수동으로 px-4 추가)</p>
            </div>
          </ResponsiveContainer>
        </section>

        {/* Semantic HTML 테스트 */}
        <section className="space-y-6">
          <ResponsiveContainer 
            as="section" 
            size="lg" 
            center
            className="bg-slate-100 border-2 border-slate-300 rounded-lg"
            aria-labelledby="semantic-title"
          >
            <div className="py-8">
              <h2 id="semantic-title" className="text-xl font-semibold text-slate-800 mb-4 text-center">
                Semantic HTML 테스트
              </h2>
              <div className="space-y-4 text-slate-600">
                <p>이 컨테이너는 &lt;section&gt; 태그로 렌더됩니다.</p>
                <p>aria-labelledby 속성을 통해 접근성을 향상시킵니다.</p>
                <p>다양한 HTML 태그로 렌더링할 수 있는 유연성을 제공합니다.</p>
              </div>
            </div>
          </ResponsiveContainer>
        </section>

        {/* ResponsiveGrid 테스트 섹션 */}
        <section className="space-y-6">
          <ResponsiveContainer center>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              ResponsiveGrid 컴포넌트 테스트
            </h2>
          </ResponsiveContainer>

          {/* 기본 그리드 */}
          <ResponsiveContainer center>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">기본 그리드 (1→2→3→4 컬럼)</h3>
              <ResponsiveGrid
                cols={1}
                sm={{ cols: 2 }}
                md={{ cols: 3 }}
                gap="md"
                className="mb-6"
                aria-label="기본 반응형 그리드 예제"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center"
                  >
                    <div className="text-blue-800 font-medium">아이템 {i + 1}</div>
                    <div className="text-blue-600 text-sm mt-1">그리드 셀</div>
                  </div>
                ))}
              </ResponsiveGrid>
            </div>
          </ResponsiveContainer>

          {/* 다양한 간격 테스트 */}
          <ResponsiveContainer center>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">반응형 간격 테스트</h3>
              <ResponsiveGrid
                cols={2}
                md={{ cols: 3 }}
                lg={{ cols: 4 }}
                gap="lg"
                className="mb-6"
                aria-label="반응형 간격 그리드 예제"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-green-100 border border-green-300 rounded-lg p-4 text-center"
                  >
                    <div className="text-green-800 font-medium">Card {i + 1}</div>
                    <div className="text-green-600 text-sm mt-1">
                      간격: xs → lg → xl
                    </div>
                  </div>
                ))}
              </ResponsiveGrid>
            </div>
          </ResponsiveContainer>

          {/* 정렬 옵션 테스트 */}
          <ResponsiveContainer center>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">정렬 옵션 테스트</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 중앙 정렬 */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Items Center</h4>
                  <ResponsiveGrid
                    cols={3}
                    gap="md"
                    alignItems="center"
                    justifyItems="center"
                    className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                  >
                    <div className="bg-purple-100 border border-purple-300 rounded p-2 text-purple-800 text-sm">
                      짧은 내용
                    </div>
                    <div className="bg-purple-100 border border-purple-300 rounded p-2 text-purple-800 text-sm">
                      조금 더 긴 내용이 들어가는 카드
                    </div>
                    <div className="bg-purple-100 border border-purple-300 rounded p-2 text-purple-800 text-sm">
                      매우 긴 내용이 들어가는 카드로서 높이가 다른 카드들보다 상당히 높을 수 있습니다.
                    </div>
                  </ResponsiveGrid>
                </div>

                {/* 시작점 정렬 */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Items Start</h4>
                  <ResponsiveGrid
                    cols={3}
                    gap="md"
                    alignItems="start"
                    justifyItems="start"
                    className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                  >
                    <div className="bg-orange-100 border border-orange-300 rounded p-2 text-orange-800 text-sm">
                      짧은 내용
                    </div>
                    <div className="bg-orange-100 border border-orange-300 rounded p-2 text-orange-800 text-sm">
                      조금 더 긴 내용이 들어가는 카드
                    </div>
                    <div className="bg-orange-100 border border-orange-300 rounded p-2 text-orange-800 text-sm">
                      매우 긴 내용이 들어가는 카드로서 높이가 다른 카드들보다 상당히 높을 수 있습니다.
                    </div>
                  </ResponsiveGrid>
                </div>
              </div>
            </div>
          </ResponsiveContainer>

          {/* Semantic HTML 테스트 */}
          <ResponsiveContainer center>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Semantic HTML 테스트</h3>
              <ResponsiveGrid
                as="section"
                cols={1}
                md={{ cols: 2 }}
                lg={{ cols: 3 }}
                gap="lg"
                role="grid"
                aria-labelledby="product-grid-title"
                className="mb-6"
              >
                <h4 id="product-grid-title" className="sr-only">상품 그리드</h4>
                {Array.from({ length: 6 }, (_, i) => (
                  <article
                    key={i}
                    className="bg-slate-100 border border-slate-300 rounded-lg p-6"
                    role="gridcell"
                  >
                    <h5 className="text-slate-800 font-semibold mb-2">제품 {i + 1}</h5>
                    <p className="text-slate-600 text-sm mb-3">
                      이 그리드는 &lt;section&gt; 태그로 렌더되며, 각 아이템은 &lt;article&gt; 태그입니다.
                    </p>
                    <div className="text-slate-500 text-xs">
                      role="grid" 및 role="gridcell" 사용
                    </div>
                  </article>
                ))}
              </ResponsiveGrid>
            </div>
          </ResponsiveContainer>
        </section>

        {/* ResponsiveStack 테스트 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">3. ResponsiveStack 테스트</h2>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700">기본 세로 스택</h3>
            <ResponsiveStack
              gap="md"
              className="bg-blue-50 p-4 rounded-lg"
            >
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-800">스택 아이템 1</h4>
                <p className="text-sm text-gray-600">기본 세로 방향 스택입니다.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-800">스택 아이템 2</h4>
                <p className="text-sm text-gray-600">gap이 medium으로 설정되어 있습니다.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-800">스택 아이템 3</h4>
                <p className="text-sm text-gray-600">align이 stretch로 설정되어 있습니다.</p>
              </div>
            </ResponsiveStack>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700">반응형 방향 변경 (세로 → 가로)</h3>
            <ResponsiveStack
              direction="column"
              md={{ direction: 'row', gap: 'lg' }}
              gap="sm"
              className="bg-green-50 p-4 rounded-lg"
            >
              <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
                <h4 className="font-medium text-gray-800">카드 1</h4>
                <p className="text-sm text-gray-600">모바일에서는 세로로 배치됩니다.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
                <h4 className="font-medium text-gray-800">카드 2</h4>
                <p className="text-sm text-gray-600">태블릿 이상에서는 가로로 배치됩니다.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
                <h4 className="font-medium text-gray-800">카드 3</h4>
                <p className="text-sm text-gray-600">gap도 화면 크기에 따라 변경됩니다.</p>
              </div>
            </ResponsiveStack>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700">정렬 옵션 테스트</h3>
            <ResponsiveStack
              direction="row"
              gap="md"
              align="center"
              justify="between"
              className="bg-purple-50 p-4 rounded-lg min-h-24"
            >
              <div className="bg-white p-2 rounded shadow-sm">
                <p className="text-xs">작은 박스</p>
              </div>
              <div className="bg-white p-4 rounded shadow-sm">
                <p className="text-xs">중간 박스</p>
              </div>
              <div className="bg-white p-6 rounded shadow-sm">
                <p className="text-xs">큰 박스</p>
              </div>
            </ResponsiveStack>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700">wrap 기능 테스트</h3>
            <ResponsiveStack
              direction="row"
              gap="sm"
              wrap={true}
              className="bg-yellow-50 p-4 rounded-lg"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded-lg shadow-sm min-w-32"
                >
                  <p className="text-sm font-medium">아이템 {i + 1}</p>
                </div>
              ))}
            </ResponsiveStack>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">의미론적 HTML 및 접근성 테스트</h3>
            <ResponsiveStack
              as="nav"
              direction="row"
              gap="md"
              role="navigation"
              aria-label="메인 네비게이션"
              className="bg-gray-100 p-4 rounded-lg"
            >
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  홈
                </a>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  서비스
                </a>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  연락처
                </a>
              </div>
            </ResponsiveStack>
          </div>
        </section>

        {/* 조합 테스트 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">4. 컴포넌트 조합 테스트</h2>
          
          <ResponsiveContainer size="lg" padding="lg">
            <ResponsiveStack gap="xl">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">대시보드 레이아웃 예시</h3>
                <p className="text-gray-600">Container + Stack + Grid 조합</p>
              </div>
              
                              <ResponsiveGrid
                  cols={1}
                  md={{ cols: 2 }}
                  lg={{ cols: 3 }}
                  gap="md"
                >
                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <h4 className="font-semibold text-gray-800 mb-2">통계 카드 1</h4>
                  <p className="text-2xl font-bold text-blue-600">1,234</p>
                  <p className="text-sm text-gray-500">총 사용자 수</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <h4 className="font-semibold text-gray-800 mb-2">통계 카드 2</h4>
                  <p className="text-2xl font-bold text-green-600">5,678</p>
                  <p className="text-sm text-gray-500">총 주문 수</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <h4 className="font-semibold text-gray-800 mb-2">통계 카드 3</h4>
                  <p className="text-2xl font-bold text-purple-600">9,012</p>
                  <p className="text-sm text-gray-500">총 매출</p>
                </div>
              </ResponsiveGrid>
              
              <ResponsiveStack
                direction="column"
                lg={{ direction: 'row' }}
                gap="md"
              >
                <div className="bg-white p-6 rounded-lg shadow-md border flex-2">
                  <h4 className="font-semibold text-gray-800 mb-4">메인 차트 영역</h4>
                  <div className="bg-gray-100 h-48 rounded flex items-center justify-center">
                    <p className="text-gray-500">차트 컴포넌트 위치</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border flex-1">
                  <h4 className="font-semibold text-gray-800 mb-4">사이드 정보</h4>
                  <ResponsiveStack gap="sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium">알림 1</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium">알림 2</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium">알림 3</p>
                    </div>
                  </ResponsiveStack>
                </div>
              </ResponsiveStack>
            </ResponsiveStack>
          </ResponsiveContainer>
        </section>

        {/* 브라우저 크기 조정 안내 */}
        <ResponsiveContainer center className="bg-amber-50 border border-amber-200 rounded-lg">
          <div className="py-6 text-center">
            <h3 className="text-lg font-medium text-amber-800 mb-2">
              🔍 테스트 방법
            </h3>
            <div className="space-y-2 text-amber-700">
              <p>브라우저 창의 크기를 조정하여 다음 사항들을 확인해보세요:</p>
              <ul className="text-left inline-block space-y-1">
                <li>• ResponsiveContainer: 패딩이 반응형으로 변경</li>
                <li>• ResponsiveGrid: 컬럼 수가 화면 크기에 따라 변경</li>
                <li>• 간격(gap)이 브레이크포인트별로 조정</li>
                <li>• 정렬 옵션이 다양한 높이의 콘텐츠에 적용</li>
              </ul>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 