import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import {
  Heart,
  Share,
  MoreVertical,
  Star,
  MessageCircle,
  Bookmark,
} from 'lucide-react';
import {
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardDescription,
  MobileCardAction,
  MobileCardContent,
  MobileCardFooter,
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardAction,
  ResponsiveCardContent,
  ResponsiveCardFooter,
} from '~/common/components/responsive';

export function meta() {
  return [
    { title: 'Mobile Card Test - SureCRM' },
    {
      name: 'description',
      content: 'Testing mobile-optimized card components',
    },
  ];
}

export default function TestMobileCard() {
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const [bookmarkedCards, setBookmarkedCards] = useState<Set<string>>(
    new Set()
  );
  const [actionLog, setActionLog] = useState<string[]>([]);

  const logAction = (action: string) => {
    setActionLog(prev => [
      ...prev.slice(-4),
      `${new Date().toLocaleTimeString()}: ${action}`,
    ]);
  };

  const toggleLike = (cardId: string) => {
    setLikedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
        logAction(`Unliked ${cardId}`);
      } else {
        newSet.add(cardId);
        logAction(`Liked ${cardId}`);
      }
      return newSet;
    });
  };

  const toggleBookmark = (cardId: string) => {
    setBookmarkedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
        logAction(`Unbookmarked ${cardId}`);
      } else {
        newSet.add(cardId);
        logAction(`Bookmarked ${cardId}`);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Mobile Card Components</h1>
          <p className="text-muted-foreground text-sm">
            모바일 최적화된 카드 컴포넌트 테스트
          </p>
        </div>

        {/* Action Log */}
        {actionLog.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <h3 className="text-sm font-medium">최근 액션:</h3>
            {actionLog.map((action, index) => (
              <p key={index} className="text-xs text-muted-foreground">
                {action}
              </p>
            ))}
          </div>
        )}

        {/* 1. Basic Mobile Card */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">1. 기본 모바일 카드</h2>
          <MobileCard>
            <MobileCardHeader>
              <MobileCardTitle>기본 카드</MobileCardTitle>
              <MobileCardDescription>
                모바일에 최적화된 기본 카드 컴포넌트입니다.
              </MobileCardDescription>
            </MobileCardHeader>
            <MobileCardContent>
              <p className="text-sm">
                이 카드는 모바일 화면에서 최적의 사용자 경험을 제공하도록
                설계되었습니다. 터치 친화적인 크기와 간격을 가지고 있습니다.
              </p>
            </MobileCardContent>
          </MobileCard>
        </div>

        {/* 2. Interactive Card with Touch Feedback */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">2. 터치 피드백 카드</h2>
          <MobileCard
            interaction="tap"
            touchFeedback={true}
            onTap={() => logAction('터치 피드백 카드 탭됨')}
          >
            <MobileCardHeader>
              <MobileCardTitle>터치 피드백</MobileCardTitle>
              <MobileCardDescription>
                탭하면 시각적 피드백과 햅틱 피드백을 제공합니다.
              </MobileCardDescription>
            </MobileCardHeader>
            <MobileCardContent>
              <p className="text-sm">
                이 카드를 탭해보세요! 시각적 피드백과 함께 진동 피드백을 느낄 수
                있습니다.
              </p>
            </MobileCardContent>
          </MobileCard>
        </div>

        {/* 3. Swipe Actions Card */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">3. 스와이프 액션 카드</h2>
          <MobileCard
            interaction="swipe"
            swipeActions={true}
            onSwipeLeft={() => logAction('왼쪽으로 스와이프 (삭제)')}
            onSwipeRight={() => logAction('오른쪽으로 스와이프 (좋아요)')}
            elevation="medium"
          >
            <MobileCardHeader>
              <MobileCardTitle>스와이프 액션</MobileCardTitle>
              <MobileCardDescription>
                좌우로 스와이프하여 액션을 실행할 수 있습니다.
              </MobileCardDescription>
            </MobileCardHeader>
            <MobileCardContent>
              <div className="flex items-center justify-between text-sm">
                <span>← 왼쪽: 삭제</span>
                <span>오른쪽: 좋아요 →</span>
              </div>
            </MobileCardContent>
          </MobileCard>
        </div>

        {/* 4. Long Press Card */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">4. 롱 프레스 카드</h2>
          <MobileCard
            interaction="long-press"
            onLongPress={() => logAction('롱 프레스 감지됨')}
            elevation="high"
          >
            <MobileCardHeader>
              <MobileCardTitle>롱 프레스</MobileCardTitle>
              <MobileCardDescription>
                길게 눌러서 컨텍스트 메뉴를 열 수 있습니다.
              </MobileCardDescription>
            </MobileCardHeader>
            <MobileCardContent>
              <p className="text-sm">
                이 카드를 0.5초 이상 길게 눌러보세요. 햅틱 피드백과 함께 액션이
                실행됩니다.
              </p>
            </MobileCardContent>
          </MobileCard>
        </div>

        {/* 5. Social Media Style Card */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">5. 소셜 미디어 스타일</h2>
          <MobileCard size="comfortable" elevation="low">
            <MobileCardHeader compact={false}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <div className="flex-1">
                  <MobileCardTitle>John Doe</MobileCardTitle>
                  <MobileCardDescription>2시간 전</MobileCardDescription>
                </div>
              </div>
              <MobileCardAction position="top-right">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </MobileCardAction>
            </MobileCardHeader>
            <MobileCardContent>
              <p className="text-sm mb-3">
                모바일 앱 개발에서 사용자 경험은 정말 중요합니다. 특히 터치
                인터랙션과 피드백은 앱의 품질을 좌우하는 핵심 요소라고 생각해요!
                🚀
              </p>
              <div className="bg-muted rounded-lg p-3 mb-3">
                <p className="text-xs text-muted-foreground">
                  첨부된 이미지: mobile-ux-design.jpg
                </p>
              </div>
            </MobileCardContent>
            <MobileCardFooter actions={true}>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => toggleLike('social-card')}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${
                      likedCards.has('social-card')
                        ? 'fill-red-500 text-red-500'
                        : ''
                    }`}
                  />
                  <span className="text-xs">
                    {likedCards.has('social-card') ? '124' : '123'}
                  </span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs">42</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Share className="h-4 w-4 mr-1" />
                  <span className="text-xs">공유</span>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleBookmark('social-card')}
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    bookmarkedCards.has('social-card') ? 'fill-current' : ''
                  }`}
                />
              </Button>
            </MobileCardFooter>
          </MobileCard>
        </div>

        {/* 6. Product Card */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">6. 상품 카드</h2>
          <MobileCard
            size="spacious"
            elevation="medium"
            interaction="tap"
            touchFeedback={true}
            onTap={() => logAction('상품 카드 선택됨')}
          >
            <MobileCardContent>
              <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg h-32 mb-3 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <MobileCardTitle>iPhone 15 Pro</MobileCardTitle>
                  <Badge variant="secondary">신상품</Badge>
                </div>
                <MobileCardDescription>
                  최신 A17 Pro 칩셋과 티타늄 디자인
                </MobileCardDescription>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className="h-3 w-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      (4.8)
                    </span>
                  </div>
                  <span className="text-lg font-bold">₩1,550,000</span>
                </div>
              </div>
            </MobileCardContent>
            <MobileCardFooter>
              <Button className="w-full">장바구니에 추가</Button>
            </MobileCardFooter>
          </MobileCard>
        </div>

        {/* 7. Responsive Card */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">7. 반응형 카드</h2>
          <ResponsiveCard
            mobileSize="comfortable"
            mobileInteraction="tap"
            mobileTouchFeedback={true}
            onMobileTap={() => logAction('반응형 카드 (모바일 모드) 탭됨')}
          >
            <ResponsiveCardHeader>
              <ResponsiveCardTitle>반응형 카드</ResponsiveCardTitle>
              <ResponsiveCardDescription>
                화면 크기에 따라 자동으로 모바일/데스크톱 버전을 선택합니다.
              </ResponsiveCardDescription>
            </ResponsiveCardHeader>
            <ResponsiveCardContent>
              <p className="text-sm">
                현재 화면 크기: 768px 미만이면 모바일 카드, 이상이면 데스크톱
                카드가 표시됩니다.
              </p>
            </ResponsiveCardContent>
            <ResponsiveCardFooter>
              <Button variant="outline" size="sm">
                더 알아보기
              </Button>
            </ResponsiveCardFooter>
          </ResponsiveCard>
        </div>

        {/* 8. Compact Cards Grid */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">8. 컴팩트 카드 그리드</h2>
          <div className="grid grid-cols-2 gap-3">
            {['알림', '설정', '도움말', '피드백'].map((title, index) => (
              <MobileCard
                key={title}
                size="compact"
                elevation="low"
                interaction="tap"
                touchFeedback={true}
                onTap={() => logAction(`${title} 카드 탭됨`)}
              >
                <MobileCardContent>
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg">
                        {['🔔', '⚙️', '❓', '💬'][index]}
                      </span>
                    </div>
                    <MobileCardTitle className="text-sm">
                      {title}
                    </MobileCardTitle>
                  </div>
                </MobileCardContent>
              </MobileCard>
            ))}
          </div>
        </div>

        {/* 9. Scrollable Content Card */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">9. 스크롤 가능한 카드</h2>
          <MobileCard size="default" elevation="medium">
            <MobileCardHeader>
              <MobileCardTitle>긴 콘텐츠</MobileCardTitle>
              <MobileCardDescription>
                스크롤 가능한 콘텐츠 영역을 가진 카드입니다.
              </MobileCardDescription>
            </MobileCardHeader>
            <MobileCardContent scrollable={true} maxHeight="120px">
              <div className="space-y-3">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                    스크롤 가능한 아이템 {i + 1}: 이것은 긴 텍스트 콘텐츠의
                    예시입니다. 사용자는 이 영역을 스크롤하여 더 많은 내용을 볼
                    수 있습니다.
                  </div>
                ))}
              </div>
            </MobileCardContent>
            <MobileCardFooter sticky={true}>
              <Button variant="outline" size="sm" className="w-full">
                전체 보기
              </Button>
            </MobileCardFooter>
          </MobileCard>
        </div>

        {/* 10. Floating Action Card */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">10. 플로팅 액션 카드</h2>
          <MobileCard size="comfortable" elevation="high">
            <MobileCardHeader>
              <MobileCardTitle>플로팅 액션</MobileCardTitle>
              <MobileCardDescription>
                플로팅 액션 버튼이 있는 카드입니다.
              </MobileCardDescription>
            </MobileCardHeader>
            <MobileCardContent>
              <p className="text-sm mb-4">
                이 카드는 우측 하단에 플로팅 액션 버튼을 가지고 있습니다. 주요
                액션을 강조하고 싶을 때 사용할 수 있습니다.
              </p>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  플로팅 버튼은 카드 위에 떠있는 형태로 표시됩니다.
                </p>
              </div>
            </MobileCardContent>
            <MobileCardAction position="bottom-right" floating={true}>
              <Button
                size="icon"
                className="rounded-full shadow-lg"
                onClick={() => logAction('플로팅 액션 버튼 클릭됨')}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </MobileCardAction>
          </MobileCard>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            모든 카드 컴포넌트는 WCAG 2.5.5 AAA 기준을 준수합니다.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            최소 터치 타겟 크기: 44px × 44px
          </p>
        </div>
      </div>
    </div>
  );
}
