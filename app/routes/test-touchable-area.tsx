import { useState } from 'react';
import { TouchableArea } from '~/common/components/responsive';
import {
  Heart,
  Star,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';

export function meta() {
  return [
    { title: 'TouchableArea 컴포넌트 테스트 - SureCRM' },
    {
      name: 'description',
      content:
        'TouchableArea 컴포넌트의 다양한 사용 사례와 접근성 기능을 테스트합니다.',
    },
  ];
}

export default function TestTouchableAreaPage() {
  const [likeCount, setLikeCount] = useState(0);
  const [isStarred, setIsStarred] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');
  const [selectedOption, setSelectedOption] = useState('option1');
  const [isExpanded, setIsExpanded] = useState(false);
  const [pressCount, setPressCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TouchableArea 컴포넌트 테스트
          </h1>
          <p className="text-gray-600">
            WCAG 2.5.5 준수 터치 상호작용 컴포넌트의 다양한 사용 사례
          </p>
        </div>

        {/* 기본 버튼 스타일 */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">기본 버튼 스타일</h2>
          <div className="flex flex-wrap gap-4">
            <TouchableArea
              onPress={() => setPressCount(prev => prev + 1)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              aria-label="기본 버튼"
            >
              클릭 ({pressCount})
            </TouchableArea>

            <TouchableArea
              onPress={() => alert('보조 버튼 클릭!')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              aria-label="보조 버튼"
            >
              보조 버튼
            </TouchableArea>

            <TouchableArea
              disabled
              className="bg-gray-100 text-gray-400 px-4 py-2 rounded-md"
              aria-label="비활성화된 버튼"
            >
              비활성화
            </TouchableArea>
          </div>
        </section>

        {/* 크기 변형 */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">크기 변형</h2>
          <div className="flex flex-wrap items-center gap-4">
            <TouchableArea
              size="sm"
              onPress={() => alert('작은 버튼')}
              className="bg-green-500 text-white rounded-md hover:bg-green-600"
              aria-label="작은 크기 버튼"
            >
              Small
            </TouchableArea>

            <TouchableArea
              size="md"
              onPress={() => alert('중간 버튼')}
              className="bg-green-500 text-white rounded-md hover:bg-green-600"
              aria-label="중간 크기 버튼"
            >
              Medium
            </TouchableArea>

            <TouchableArea
              size="lg"
              onPress={() => alert('큰 버튼')}
              className="bg-green-500 text-white rounded-md hover:bg-green-600"
              aria-label="큰 크기 버튼"
            >
              Large
            </TouchableArea>

            <TouchableArea
              size="xl"
              onPress={() => alert('매우 큰 버튼')}
              className="bg-green-500 text-white rounded-md hover:bg-green-600"
              aria-label="매우 큰 크기 버튼"
            >
              Extra Large
            </TouchableArea>
          </div>
        </section>

        {/* 피드백 강도 */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">터치 피드백 강도</h2>
          <div className="flex flex-wrap gap-4">
            <TouchableArea
              feedbackIntensity="subtle"
              onPress={() => alert('미묘한 피드백')}
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
              aria-label="미묘한 피드백 버튼"
            >
              Subtle
            </TouchableArea>

            <TouchableArea
              feedbackIntensity="medium"
              onPress={() => alert('중간 피드백')}
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
              aria-label="중간 피드백 버튼"
            >
              Medium
            </TouchableArea>

            <TouchableArea
              feedbackIntensity="strong"
              onPress={() => alert('강한 피드백')}
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
              aria-label="강한 피드백 버튼"
            >
              Strong
            </TouchableArea>

            <TouchableArea
              enableFeedback={false}
              onPress={() => alert('피드백 없음')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              aria-label="피드백 없는 버튼"
            >
              No Feedback
            </TouchableArea>
          </div>
        </section>

        {/* 아이콘 버튼 */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">아이콘 버튼</h2>
          <div className="flex flex-wrap gap-4">
            <TouchableArea
              onPress={() => setLikeCount(prev => prev + 1)}
              className="bg-red-500 text-white rounded-full hover:bg-red-600"
              aria-label={`좋아요 ${likeCount}개`}
              size="lg"
            >
              <Heart
                className="w-5 h-5"
                fill={likeCount > 0 ? 'currentColor' : 'none'}
              />
              {likeCount > 0 && <span className="ml-1">{likeCount}</span>}
            </TouchableArea>

            <TouchableArea
              onPress={() => setIsStarred(!isStarred)}
              className={`rounded-full ${isStarred ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-300 hover:bg-gray-400'} text-white`}
              aria-label={isStarred ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              aria-pressed={isStarred}
              size="lg"
            >
              <Star
                className="w-5 h-5"
                fill={isStarred ? 'currentColor' : 'none'}
              />
            </TouchableArea>

            <TouchableArea
              onPress={() => alert('설정 열기')}
              className="bg-gray-600 text-white rounded-full hover:bg-gray-700"
              aria-label="설정"
              size="lg"
            >
              <Settings className="w-5 h-5" />
            </TouchableArea>
          </div>
        </section>

        {/* 미디어 컨트롤 */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">미디어 컨트롤</h2>
          <div className="flex items-center gap-4">
            <TouchableArea
              onPress={() => setIsPlaying(!isPlaying)}
              className="bg-blue-600 text-white rounded-full hover:bg-blue-700"
              aria-label={isPlaying ? '일시정지' : '재생'}
              aria-pressed={isPlaying}
              size="xl"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </TouchableArea>

            <TouchableArea
              onPress={() => setIsMuted(!isMuted)}
              className="bg-gray-600 text-white rounded-full hover:bg-gray-700"
              aria-label={isMuted ? '음소거 해제' : '음소거'}
              aria-pressed={isMuted}
              size="lg"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </TouchableArea>
          </div>
        </section>

        {/* 탭 네비게이션 */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">탭 네비게이션</h2>
          <div className="flex border-b border-gray-200">
            {[
              { id: 'home', label: '홈' },
              { id: 'profile', label: '프로필' },
              { id: 'settings', label: '설정' },
              { id: 'help', label: '도움말' },
            ].map(tab => (
              <TouchableArea
                key={tab.id}
                role="tab"
                onPress={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                aria-label={`${tab.label} 탭`}
                aria-selected={selectedTab === tab.id}
                enforceMinSize={false}
              >
                {tab.label}
              </TouchableArea>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p>
              선택된 탭: <strong>{selectedTab}</strong>
            </p>
          </div>
        </section>

        {/* 옵션 선택 */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">옵션 선택</h2>
          <div className="space-y-2">
            {[
              { id: 'option1', label: '옵션 1' },
              { id: 'option2', label: '옵션 2' },
              { id: 'option3', label: '옵션 3' },
            ].map(option => (
              <TouchableArea
                key={option.id}
                role="option"
                onPress={() => setSelectedOption(option.id)}
                className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${
                  selectedOption === option.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                aria-label={option.label}
                aria-selected={selectedOption === option.id}
              >
                {option.label}
              </TouchableArea>
            ))}
          </div>
        </section>

        {/* 확장 가능한 섹션 */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">확장 가능한 섹션</h2>
          <TouchableArea
            onPress={() => setIsExpanded(!isExpanded)}
            className="w-full text-left px-4 py-3 bg-gray-100 rounded-md hover:bg-gray-200"
            aria-label="상세 정보 토글"
            aria-expanded={isExpanded}
          >
            <div className="flex justify-between items-center">
              <span>상세 정보 {isExpanded ? '숨기기' : '보기'}</span>
              <span
                className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </div>
          </TouchableArea>

          {isExpanded && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p>여기에 상세 정보가 표시됩니다.</p>
              <p>
                TouchableArea 컴포넌트는 WCAG 2.5.5 Target Size (AAA)
                가이드라인을 준수합니다.
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>최소 44x44px 터치 타겟 크기</li>
                <li>키보드 접근성 완전 지원</li>
                <li>스크린 리더 호환성</li>
                <li>햅틱 피드백 지원</li>
              </ul>
            </div>
          )}
        </section>

        {/* 접근성 정보 */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            접근성 기능
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">키보드 지원</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• Tab: 포커스 이동</li>
                <li>• Enter/Space: 활성화</li>
                <li>• 시각적 포커스 표시</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">스크린 리더</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• ARIA 라벨 지원</li>
                <li>• 상태 정보 제공</li>
                <li>• 역할 정의</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">터치 지원</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• 44px+ 터치 타겟</li>
                <li>• 햅틱 피드백</li>
                <li>• 시각적 피드백</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">반응형</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• 다양한 크기 지원</li>
                <li>• 모바일 최적화</li>
                <li>• 유연한 레이아웃</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
