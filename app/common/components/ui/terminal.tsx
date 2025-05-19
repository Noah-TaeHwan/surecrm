'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';

interface TypingAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  speed?: number;
  delay?: number;
}

export function TypingAnimation({
  className,
  children,
  speed = 50,
  delay = 0,
  ...props
}: TypingAnimationProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [contentIndex, setContentIndex] = useState(0);
  const childrenArray = React.Children.toArray(children);
  const currentChild = childrenArray[contentIndex];
  const contentRef = useRef<string>('');

  // 텍스트 콘텐츠 추출
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') {
      return String(node);
    }

    if (React.isValidElement(node)) {
      const props = node.props as { children?: React.ReactNode };
      if (props && props.children) {
        if (Array.isArray(props.children)) {
          return props.children.map(getTextContent).join('');
        } else {
          return getTextContent(props.children);
        }
      }
    }

    return '';
  };

  useEffect(() => {
    if (!currentChild) return;

    // 현재 컴포넌트의 텍스트 콘텐츠 가져오기
    contentRef.current = getTextContent(currentChild);

    let currentPos = 0;
    const totalLength = contentRef.current.length;
    let timeoutId: NodeJS.Timeout;

    const typeNextChar = () => {
      if (currentPos < totalLength) {
        setDisplayedContent(contentRef.current.substring(0, currentPos + 1));
        currentPos++;
        timeoutId = setTimeout(typeNextChar, speed);
      } else if (contentIndex < childrenArray.length - 1) {
        // 다음 콘텐츠로 이동
        timeoutId = setTimeout(() => {
          setContentIndex((i) => i + 1);
          setDisplayedContent('');
        }, 1000);
      }
    };

    // 초기 딜레이 후 타이핑 시작
    timeoutId = setTimeout(typeNextChar, delay);

    return () => clearTimeout(timeoutId);
  }, [contentIndex, childrenArray, currentChild, speed, delay]);

  return (
    <div className={cn('font-mono', className)} {...props}>
      {displayedContent}
      <span className="animate-pulse text-primary">|</span>
    </div>
  );
}

interface AnimatedSpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children: React.ReactNode;
}

export function AnimatedSpan({
  className,
  children,
  ...props
}: AnimatedSpanProps) {
  return (
    <span className={cn('text-primary', className)} {...props}>
      {children}
    </span>
  );
}

interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  title?: string;
  children: React.ReactNode;
  variant?: 'dark' | 'light';
}

export function Terminal({
  className,
  title = 'Terminal',
  children,
  variant = 'dark',
  ...props
}: TerminalProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden shadow-lg border',
        variant === 'dark'
          ? 'bg-slate-900 border-slate-700'
          : 'bg-slate-100 border-slate-200',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'px-4 py-2 flex items-center justify-between',
          variant === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
        )}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div
          className={cn(
            'text-xs font-medium',
            variant === 'dark' ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          {title}
        </div>
        <div className="w-16" />
      </div>
      <div
        className={cn(
          'p-4 font-mono text-sm',
          variant === 'dark' ? 'text-slate-300' : 'text-slate-700'
        )}
      >
        {children}
      </div>
    </div>
  );
}
