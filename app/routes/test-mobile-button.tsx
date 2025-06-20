import { ResponsiveButton, MobileButton } from '~/common/components/responsive';
import { Button } from '~/common/components/ui/button';

export function meta() {
  return [
    { title: '모바일 Button 테스트 - SureCRM' },
    {
      name: 'description',
      content: '모바일 최적화된 Button 컴포넌트 테스트 페이지',
    },
  ];
}

export function loader() {
  return {
    message: '모바일 Button 컴포넌트 테스트 페이지입니다.',
  };
}

export default function TestMobileButtonPage({
  loaderData,
}: {
  loaderData: { message: string };
}) {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          모바일 Button 컴포넌트 테스트
        </h1>
        <p className="text-gray-600 mb-8">{loaderData.message}</p>
      </div>

      {/* 기본 Button vs ResponsiveButton 비교 */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          기본 Button vs ResponsiveButton
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">기본 ShadCN Button</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">기본 버튼</Button>
              <Button variant="outline">아웃라인</Button>
              <Button variant="secondary">보조</Button>
              <Button variant="destructive">삭제</Button>
              <Button variant="ghost">고스트</Button>
              <Button variant="link">링크</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              ResponsiveButton (자동 감지)
            </h3>
            <div className="flex flex-wrap gap-2">
              <ResponsiveButton variant="default">기본 버튼</ResponsiveButton>
              <ResponsiveButton variant="outline">아웃라인</ResponsiveButton>
              <ResponsiveButton variant="secondary">보조</ResponsiveButton>
              <ResponsiveButton variant="destructive">삭제</ResponsiveButton>
              <ResponsiveButton variant="ghost">고스트</ResponsiveButton>
              <ResponsiveButton variant="link">링크</ResponsiveButton>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 전용 기능 테스트 */}
      <div className="bg-blue-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">모바일 전용 기능</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">터치 피드백 옵션</h3>
            <div className="flex flex-wrap gap-2">
              <ResponsiveButton
                forceVariant="mobile"
                touchFeedback="none"
                variant="outline"
              >
                피드백 없음
              </ResponsiveButton>
              <ResponsiveButton
                forceVariant="mobile"
                touchFeedback="subtle"
                variant="outline"
              >
                약한 피드백
              </ResponsiveButton>
              <ResponsiveButton
                forceVariant="mobile"
                touchFeedback="strong"
                variant="outline"
              >
                강한 피드백
              </ResponsiveButton>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">로딩 상태</h3>
            <div className="flex flex-wrap gap-2">
              <ResponsiveButton
                forceVariant="mobile"
                loading={true}
                variant="default"
              >
                로딩 중...
              </ResponsiveButton>
              <ResponsiveButton
                forceVariant="mobile"
                loading={true}
                loadingText="처리 중..."
                variant="secondary"
              >
                원본 텍스트
              </ResponsiveButton>
            </div>
          </div>
        </div>
      </div>

      {/* 크기 옵션 테스트 */}
      <div className="bg-green-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">크기 옵션 비교</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">데스크톱 크기</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <ResponsiveButton forceVariant="desktop" size="sm">
                Small
              </ResponsiveButton>
              <ResponsiveButton forceVariant="desktop" size="default">
                Default
              </ResponsiveButton>
              <ResponsiveButton forceVariant="desktop" size="lg">
                Large
              </ResponsiveButton>
              <ResponsiveButton forceVariant="desktop" size="icon">
                🏠
              </ResponsiveButton>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              모바일 크기 (터치 최적화)
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <ResponsiveButton
                forceVariant="mobile"
                mobileOnly={{ size: 'sm' }}
              >
                Small
              </ResponsiveButton>
              <ResponsiveButton
                forceVariant="mobile"
                mobileOnly={{ size: 'default' }}
              >
                Default
              </ResponsiveButton>
              <ResponsiveButton
                forceVariant="mobile"
                mobileOnly={{ size: 'lg' }}
              >
                Large
              </ResponsiveButton>
              <ResponsiveButton
                forceVariant="mobile"
                mobileOnly={{ size: 'xl' }}
              >
                Extra Large
              </ResponsiveButton>
              <ResponsiveButton
                forceVariant="mobile"
                mobileOnly={{ size: 'icon' }}
              >
                🏠
              </ResponsiveButton>
            </div>
          </div>
        </div>
      </div>

      {/* 실제 사용 예시 */}
      <div className="bg-purple-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">실제 사용 예시</h2>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">고객 관리 액션</h3>
            <div className="flex flex-wrap gap-2">
              <ResponsiveButton variant="default">
                새 고객 추가
              </ResponsiveButton>
              <ResponsiveButton variant="outline">고객 목록</ResponsiveButton>
              <ResponsiveButton variant="secondary">필터 설정</ResponsiveButton>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">폼 액션</h3>
            <div className="flex justify-end gap-2">
              <ResponsiveButton variant="ghost">취소</ResponsiveButton>
              <ResponsiveButton variant="default">저장하기</ResponsiveButton>
            </div>
          </div>
        </div>
      </div>

      {/* 뷰포트 정보 */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">현재 뷰포트 정보</h2>
        <div className="text-sm text-gray-600">
          <p>
            화면 크기를 조절해보세요. ResponsiveButton이 자동으로 적절한 버전을
            선택합니다.
          </p>
          <p className="mt-2">
            • 768px 미만: 모바일 버전 (터치 최적화, 큰 크기, 강한 피드백)
          </p>
          <p>• 768px 이상: 데스크톱 버전 (기본 ShadCN Button)</p>
        </div>
      </div>
    </div>
  );
}
