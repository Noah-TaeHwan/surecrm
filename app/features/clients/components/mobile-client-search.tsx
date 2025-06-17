import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { Card, CardContent } from '~/common/components/ui/card';
import { 
  Search, 
  Mic, 
  MicOff, 
  X, 
  Filter,
  Loader2
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { useDeviceType, useViewport, useTouchDevice } from '~/common/hooks';

// 음성 인식 지원 여부 체크
const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// 음성 인식 API 타입 정의
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface MobileClientSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  onFiltersToggle?: () => void;
  showFiltersButton?: boolean;
  className?: string;
}

export function MobileClientSearch({
  searchQuery,
  setSearchQuery,
  placeholder = "고객명, 전화번호, 이메일로 검색...",
  onFiltersToggle,
  showFiltersButton = true,
  className
}: MobileClientSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const deviceType = useDeviceType();
  const { width } = useViewport();
  const touchCapabilities = useTouchDevice();

  // 음성 인식 초기화
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessing(false);
      setVoiceError(null);
      setInterimTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimTranscript(interimTranscript);
      
      if (finalTranscript) {
        setSearchQuery(finalTranscript.trim());
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      setIsProcessing(false);
      setInterimTranscript('');
      
      switch (event.error) {
        case 'network':
          setVoiceError('네트워크 연결을 확인해주세요');
          break;
        case 'not-allowed':
          setVoiceError('마이크 권한을 허용해주세요');
          break;
        case 'no-speech':
          setVoiceError('음성이 감지되지 않았습니다');
          break;
        default:
          setVoiceError('음성 인식 중 오류가 발생했습니다');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [setSearchQuery]);

  // 음성 인식 시작/중지
  const toggleVoiceRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setVoiceError(null);
      setIsProcessing(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  // 검색어 초기화
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setInterimTranscript('');
    setVoiceError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [setSearchQuery]);

  // 현재 표시할 검색어 (음성 인식 중에는 임시 결과 포함)
  const displayValue = interimTranscript || searchQuery;
  const hasValue = displayValue.length > 0;

  // 모바일에서는 더 큰 터치 영역과 간소화된 UI
  const isMobileLayout = deviceType === 'mobile' || width < 768;

  return (
    <div className={cn("w-full", className)}>
      <Card className={cn(
        "transition-all duration-200",
        isListening && "ring-2 ring-blue-500 bg-blue-50/50",
        voiceError && "ring-2 ring-red-500 bg-red-50/50"
      )}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {/* 검색 아이콘 */}
            <div className="flex-shrink-0">
              <Search className={cn(
                "h-5 w-5 transition-colors",
                isListening ? "text-blue-500" : "text-muted-foreground"
              )} />
            </div>

            {/* 검색 입력 필드 */}
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={displayValue}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isListening ? "음성 인식 중..." : placeholder}
                className={cn(
                  "border-none shadow-none focus-visible:ring-0 pr-8",
                  isMobileLayout && "text-base", // 모바일에서 줌 방지
                  interimTranscript && "text-blue-600 italic"
                )}
                disabled={isListening}
              />
              
              {/* 검색어 초기화 버튼 */}
              {hasValue && !isListening && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full w-8 p-0 hover:bg-transparent"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>

            {/* 음성 인식 버튼 */}
            {isSpeechRecognitionSupported() && (
              <Button
                variant={isListening ? "default" : "outline"}
                size={isMobileLayout ? "default" : "sm"}
                className={cn(
                  "flex-shrink-0 transition-all duration-200",
                  isMobileLayout && "h-10 w-10 p-0",
                  isListening && "bg-blue-500 hover:bg-blue-600 animate-pulse",
                  isProcessing && "opacity-70"
                )}
                onClick={toggleVoiceRecognition}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* 필터 버튼 (모바일에서 표시) */}
            {showFiltersButton && isMobileLayout && onFiltersToggle && (
              <Button
                variant="outline"
                size="default"
                className="flex-shrink-0 h-10 w-10 p-0"
                onClick={onFiltersToggle}
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 음성 인식 상태 표시 */}
          {(isListening || voiceError) && (
            <div className="mt-2 px-1">
              {isListening && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse animation-delay-0"></div>
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse animation-delay-150"></div>
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse animation-delay-300"></div>
                  </div>
                  <span>음성을 듣고 있습니다...</span>
                </div>
              )}
              
              {voiceError && (
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>{voiceError}</span>
                </div>
              )}
            </div>
          )}

          {/* 음성 인식 지원 안내 (지원되지 않는 경우) */}
          {!isSpeechRecognitionSupported() && isMobileLayout && (
            <div className="mt-2 text-xs text-muted-foreground px-1">
              음성 검색은 Chrome, Safari에서 지원됩니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* 사용 팁 (처음 사용 시) */}
      {isMobileLayout && searchQuery === '' && !isListening && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          💡 마이크 버튼을 눌러 음성으로 검색하세요
        </div>
      )}
    </div>
  );
}
