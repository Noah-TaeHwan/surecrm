import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

interface MobileCardSliderProps {
  children: ReactNode[];
  className?: string;
}

export function MobileCardSlider({
  children,
  className = '',
}: MobileCardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = children.length;

  // 터치 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setTranslateX(0);
  };

  // 터치 이동
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  // 터치 종료
  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    const threshold = 50; // 최소 스와이프 거리

    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentIndex > 0) {
        // 오른쪽으로 스와이프 - 이전 슬라이드
        setCurrentIndex(currentIndex - 1);
      } else if (translateX < 0 && currentIndex < totalSlides - 1) {
        // 왼쪽으로 스와이프 - 다음 슬라이드
        setCurrentIndex(currentIndex + 1);
      }
    }

    setTranslateX(0);
  };

  // 마우스 이벤트 (데스크톱 테스트용)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setTranslateX(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const currentX = e.clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    const threshold = 50;

    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (translateX < 0 && currentIndex < totalSlides - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }

    setTranslateX(0);
  };

  // 키보드 네비게이션 (접근성)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 인디케이터 클릭
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // 슬라이드 변경 시 포커스 관리
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [currentIndex]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="대시보드 카드 슬라이더"
    >
      {/* 슬라이더 컨테이너 */}
      <div
        ref={sliderRef}
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? translateX : 0}px))`,
          touchAction: 'pan-y pinch-zoom', // 세로 스크롤은 허용, 가로 스와이프만 제어
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0 px-2"
            aria-hidden={index !== currentIndex}
          >
            {child}
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center mt-4 space-x-2">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentIndex
                ? 'bg-orange-600'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`${index + 1}번째 카드로 이동`}
            style={{ minWidth: '44px', minHeight: '44px' }} // 터치 타겟 최소 크기
          />
        ))}
      </div>

      {/* 스크린 리더용 현재 위치 안내 */}
      <div className="sr-only" aria-live="polite">
        {totalSlides}개 카드 중 {currentIndex + 1}번째 카드
      </div>
    </div>
  );
}
