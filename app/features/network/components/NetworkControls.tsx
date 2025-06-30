import { Button } from '~/common/components/ui/button';
import { Search, X, Users, Link as LinkIcon } from 'lucide-react';
import { Input } from '~/common/components/ui/input';
import { Badge } from '~/common/components/ui/badge';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '~/lib/utils';
import { useBreakpoint } from '~/common/hooks/use-window-size';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface NetworkControlsProps {
  onSearch: (query: string) => void;
  searchResults?: Array<{
    id: string;
    name: string;
    type: string;
    stage?: string;
    importance?: number;
  }>;
  onNodeFocus?: (nodeId: string) => void;
  className?: string;
}

// 모바일 햅틱 피드백 함수
function safeMobileVibrate(duration: number = 10) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      if (isMobile) {
        navigator.vibrate(duration);
      }
    } catch (e) {
      // iOS나 다른 환경에서 에러 발생 시 무시
    }
  }
}

// 디바운스 훅 (검색 성능 최적화)
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function NetworkControls({
  onSearch,
  searchResults = [],
  onNodeFocus,
  className,
}: NetworkControlsProps) {
  // 🌍 다국어 번역 훅
  const { t } = useHydrationSafeTranslation('network');

  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 옵시디언 스타일 즉시 검색 (200ms 디바운스)
  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  // 검색 실행 - 옵시디언 스타일 즉시 반응
  useEffect(() => {
    onSearch(debouncedSearchTerm);
    setSelectedIndex(-1); // 검색어 변경 시 선택 인덱스 초기화
  }, [debouncedSearchTerm, onSearch]);

  // 검색 결과 정렬 및 우선순위 (옵시디언 방식)
  const sortedResults = useMemo(() => {
    if (!debouncedSearchTerm.trim() || searchResults.length === 0) return [];

    const query = debouncedSearchTerm.toLowerCase();

    return searchResults
      .map(result => {
        const name = result.name.toLowerCase();
        let score = 0;

        // 정확한 매치 (최고 점수)
        if (name === query) score += 1000;
        // 시작 부분 매치
        else if (name.startsWith(query)) score += 500;
        // 포함 매치
        else if (name.includes(query)) score += 100;

        // 중요도 보너스
        if (result.importance) score += result.importance * 10;

        // 타입 보너스 (영향력자 우선)
        if (result.type === 'influencer') score += 50;

        return { ...result, _score: score };
      })
      .filter(result => result._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 8); // 최대 8개 결과만 표시
  }, [debouncedSearchTerm, searchResults]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setIsFocused(false);
    setSelectedIndex(-1);

    // 입력 필드 초기화 및 포커스
    const inputElement = document.querySelector(
      'input[data-search-input]'
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
      inputElement.focus();
    }
  }, []);

  // 키보드 네비게이션 (옵시디언 스타일)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (sortedResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < sortedResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : sortedResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < sortedResults.length) {
            const selectedNode = sortedResults[selectedIndex];
            onNodeFocus?.(selectedNode.id);
            setIsFocused(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsFocused(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [sortedResults, selectedIndex, onNodeFocus]
  );

  // 검색 결과 항목 클릭
  const handleResultClick = useCallback(
    (nodeId: string) => {
      onNodeFocus?.(nodeId);
      setIsFocused(false);
      safeMobileVibrate(20); // 햅틱 효과 적용
    },
    [onNodeFocus]
  );

  // 검색 상태 표시기
  const isSearchActive = searchTerm.trim().length > 0;
  const hasResults = sortedResults.length > 0;

  const { isMobile } = useBreakpoint();

  return (
    <div className={cn('relative', className)}>
      {/* 메인 검색 바 */}
      <div className="flex  items-center justify-between py-2 border-b ">
        <div className="flex items-center space-x-4 flex-1">
          {/* 검색 입력 필드 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-search-input
              type="text"
              placeholder={t(
                'search.placeholder',
                '고객 이름으로 검색... (실시간)'
              )}
              className={cn(
                'pl-10 pr-10 transition-all duration-200',
                isFocused && 'ring-2 ring-primary/20 border-primary',
                isSearchActive && 'bg-primary/5'
              )}
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // 약간의 지연을 두고 포커스 해제 (클릭 이벤트 처리 위해)
                setTimeout(() => setIsFocused(false), 200);
              }}
            />
            {isSearchActive && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-destructive/10"
                onClick={handleClearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* 검색 상태 표시 */}
          {isSearchActive && (
            <div className="flex items-center space-x-2">
              <Badge
                variant={hasResults ? 'default' : 'secondary'}
                className="text-xs"
              >
                <Search className="h-3 w-3 mr-1" />
                {hasResults
                  ? t('search.resultsFound', '{{count}}개 발견', {
                      count: sortedResults.length,
                    })
                  : t('search.searching', '검색 중...')}
              </Badge>

              {hasResults && (
                <Badge variant="outline" className="text-xs">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  {t('search.connectedNodes', '연결된 노드 포함')}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 옵시디언 스타일 검색 결과 드롭다운 - 모든 환경에서 활성화 */}
      {isFocused && isSearchActive && (
        <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-lg mt-1 max-h-64 overflow-auto">
          {hasResults ? (
            <div className="p-2 space-y-1">
              {sortedResults.map((result, index) => (
                <div
                  key={result.id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-sm cursor-pointer transition-colors',
                    index === selectedIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => handleResultClick(result.id)}
                  style={{
                    // 모바일에서 터치 타겟 크기 최적화
                    minHeight: isMobile ? '40px' : 'auto',
                    padding: isMobile ? '12px' : '8px',
                  }}
                >
                  <div className="flex items-center space-x-2">
                    {result.type === 'influencer' ? (
                      <Users className="h-4 w-4 text-amber-500" />
                    ) : (
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          result.stage === '계약 완료'
                            ? 'bg-green-500'
                            : result.stage === '계약 검토'
                              ? 'bg-red-500'
                              : result.stage === '상품 설명'
                                ? 'bg-blue-500'
                                : result.stage === '니즈 분석'
                                  ? 'bg-amber-500'
                                  : 'bg-muted-foreground'
                        )}
                      />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs opacity-70">
                    {result.stage && (
                      <Badge variant="secondary" className="text-xs py-0">
                        {result.stage}
                      </Badge>
                    )}
                    {result.importance && result.importance > 3 && (
                      <Badge variant="outline" className="text-xs py-0">
                        ★{result.importance}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              {t('search.noResults', '검색 결과가 없습니다')}
            </div>
          )}

          {/* 키보드 단축키 안내 */}
          {hasResults && (
            <div className="border-t p-2 text-xs text-muted-foreground bg-muted/50">
              <span className="font-mono">↑↓</span>{' '}
              {t('search.navigation.move', '이동')} •
              <span className="font-mono">Enter</span>{' '}
              {t('search.navigation.select', '선택')} •
              <span className="font-mono">Esc</span>{' '}
              {t('search.navigation.close', '닫기')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
