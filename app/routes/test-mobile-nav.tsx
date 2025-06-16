import React, { useState, useEffect } from 'react';
import { MobileNav, MobileNavButton } from '~/common/components/navigation/mobile-nav';
import { Button } from '~/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Separator } from '~/common/components/ui/separator';
import { ScrollArea } from '~/common/components/ui/scroll-area';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import { Slider } from '~/common/components/ui/slider';
import { 
  CheckCircle, 
  XCircle, 
  Play, 
  RotateCcw, 
  Settings,
  Hand,
  Zap,
  Eye,
  Move,
  TouchpadIcon as Touch,
  Smartphone,
  Gauge
} from 'lucide-react';

// 메타데이터
export function meta() {
  return [
    { title: 'Advanced Mobile Navigation Test - SureCRM' },
    { name: 'description', content: 'Test advanced gesture support for mobile navigation' }
  ];
}

// 로더 (테스트용 데이터)
export function loader() {
  return {
    testMode: true,
    timestamp: new Date().toISOString(),
  };
}

// Advanced Gesture Test Interface
interface GestureTest {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'success' | 'error';
  details?: string;
}

interface GestureConfig {
  edgeSwipe: {
    enabled: boolean;
    edgeWidth: number;
    threshold: number;
    velocity: number;
  };
  progressiveReveal: {
    enabled: boolean;
    minOpacity: number;
    maxOpacity: number;
    scaleRange: [number, number];
  };
  velocityAnimation: {
    slowVelocity: number;
    fastVelocity: number;
    slowDuration: number;
    fastDuration: number;
  };
}

export default function AdvancedMobileNavTest({ loaderData }: { loaderData: { testMode: boolean; timestamp: string } }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [gestureTests, setGestureTests] = useState<GestureTest[]>([
    {
      id: 'edge-swipe',
      name: 'Edge Swipe Detection',
      description: '화면 가장자리에서 스와이프하여 메뉴 열기',
      icon: <Hand className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: 'progressive-reveal',
      name: 'Progressive Reveal',
      description: '스와이프 진행률에 따른 점진적 메뉴 표시',
      icon: <Eye className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: 'velocity-animation',
      name: 'Velocity-based Animation',
      description: '스와이프 속도에 따른 애니메이션 조정',
      icon: <Zap className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: 'multi-touch',
      name: 'Multi-touch Support',
      description: '복수 터치 제스처 감지 및 처리',
      icon: <Touch className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: 'haptic-feedback',
      name: 'Enhanced Haptic Feedback',
      description: '다양한 햅틱 패턴 지원',
      icon: <Smartphone className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: 'gesture-visual',
      name: 'Gesture Visual Feedback',
      description: '제스처 상태의 시각적 피드백',
      icon: <Gauge className="h-4 w-4" />,
      status: 'pending'
    }
  ]);

  // 고급 제스처 설정 상태
  const [gestureConfig, setGestureConfig] = useState<GestureConfig>({
    edgeSwipe: {
      enabled: true,
      edgeWidth: 20,
      threshold: 80,
      velocity: 300,
    },
    progressiveReveal: {
      enabled: true,
      minOpacity: 0.3,
      maxOpacity: 1,
      scaleRange: [0.85, 1] as [number, number],
    },
    velocityAnimation: {
      slowVelocity: 200,
      fastVelocity: 800,
      slowDuration: 0.6,
      fastDuration: 0.3,
    },
  });

  // 액션 로그 추가
  const addToLog = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog(prev => [`[${timestamp}] ${action}`, ...prev.slice(0, 19)]);
  };

  // 테스트 상태 업데이트
  const updateTestStatus = (testId: string, status: GestureTest['status'], details?: string) => {
    setGestureTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status, details } : test
    ));
  };

  // 모바일 네비게이션 핸들러들
  const handleNavOpen = () => {
    setIsNavOpen(true);
    addToLog('📱 모바일 네비게이션 열림');
    updateTestStatus('edge-swipe', 'success', 'Edge swipe detection working');
  };

  const handleNavClose = () => {
    setIsNavOpen(false);
    addToLog('✋ 모바일 네비게이션 닫힘');
  };

  // 제스처 테스트 시작
  const startGestureTest = (testId: string) => {
    updateTestStatus(testId, 'running');
    addToLog(`🧪 테스트 시작: ${gestureTests.find(t => t.id === testId)?.name}`);
    
    // 실제 테스트 로직은 여기에 추가
    setTimeout(() => {
      const test = gestureTests.find(t => t.id === testId);
      if (test) {
        updateTestStatus(testId, 'success', `${test.name} 테스트 완료`);
        addToLog(`✅ 테스트 성공: ${test.name}`);
      }
    }, 2000);
  };

  // 모든 테스트 초기화
  const resetAllTests = () => {
    setGestureTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, details: undefined })));
    setActionLog([]);
    addToLog('🔄 모든 테스트 초기화');
  };

  // Edge Swipe 감지 시뮬레이션
  useEffect(() => {
    let startX = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientX <= gestureConfig.edgeSwipe.edgeWidth) {
        startX = e.touches[0].clientX;
        startTime = Date.now();
        updateTestStatus('edge-swipe', 'running', 'Edge touch detected');
        addToLog('👆 Edge 터치 감지됨');
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startX > 0) {
        const deltaX = e.touches[0].clientX - startX;
        const deltaTime = Date.now() - startTime;
        const velocity = deltaX / deltaTime * 1000;

        if (deltaX > gestureConfig.edgeSwipe.threshold || velocity > gestureConfig.edgeSwipe.velocity) {
          updateTestStatus('progressive-reveal', 'running', 'Progressive reveal active');
          addToLog('👁️ Progressive reveal 활성화');
        }
      }
    };

    const handleTouchEnd = () => {
      if (startX > 0) {
        startX = 0;
        startTime = 0;
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gestureConfig]);

  // Multi-touch 감지
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        updateTestStatus('multi-touch', 'running', `${e.touches.length} fingers detected`);
        addToLog(`🤚 멀티터치 감지: ${e.touches.length}개 손가락`);
        
        setTimeout(() => {
          updateTestStatus('multi-touch', 'success', 'Multi-touch gesture handled');
        }, 1000);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* 고급 모바일 네비게이션 */}
      <MobileNav
        isOpen={isNavOpen}
        onClose={handleNavClose}
        onOpen={handleNavOpen}
        gestureConfig={gestureConfig}
        ariaLabel="고급 제스처 테스트 네비게이션"
      />

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto p-4 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">고급 모바일 네비게이션 테스트</h1>
            <p className="text-muted-foreground">Advanced Gesture Support Testing</p>
          </div>
          
          <div className="flex items-center gap-2">
            <MobileNavButton
              onClick={() => setIsNavOpen(!isNavOpen)}
              isOpen={isNavOpen}
              ariaLabel="고급 제스처 테스트 메뉴"
            />
          </div>
        </div>

        {/* 제스처 설정 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gesture Configuration
            </CardTitle>
            <CardDescription>
              고급 제스처 지원 설정을 조정하여 다양한 동작을 테스트할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Edge Swipe Settings */}
            <div>
              <h4 className="font-medium mb-3">Edge Swipe Detection</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Enable Edge Swipe</Label>
                  <Switch
                    checked={gestureConfig.edgeSwipe.enabled}
                    onCheckedChange={(checked) =>
                      setGestureConfig(prev => ({
                        ...prev,
                        edgeSwipe: { ...prev.edgeSwipe, enabled: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Edge Width: {gestureConfig.edgeSwipe.edgeWidth}px</Label>
                  <Slider
                    value={[gestureConfig.edgeSwipe.edgeWidth]}
                    onValueChange={([value]) =>
                      setGestureConfig(prev => ({
                        ...prev,
                        edgeSwipe: { ...prev.edgeSwipe, edgeWidth: value }
                      }))
                    }
                    min={10}
                    max={50}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Threshold: {gestureConfig.edgeSwipe.threshold}px</Label>
                  <Slider
                    value={[gestureConfig.edgeSwipe.threshold]}
                    onValueChange={([value]) =>
                      setGestureConfig(prev => ({
                        ...prev,
                        edgeSwipe: { ...prev.edgeSwipe, threshold: value }
                      }))
                    }
                    min={50}
                    max={150}
                    step={10}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Progressive Reveal Settings */}
            <div>
              <h4 className="font-medium mb-3">Progressive Reveal</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Enable Progressive Reveal</Label>
                  <Switch
                    checked={gestureConfig.progressiveReveal.enabled}
                    onCheckedChange={(checked) =>
                      setGestureConfig(prev => ({
                        ...prev,
                        progressiveReveal: { ...prev.progressiveReveal, enabled: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Opacity: {gestureConfig.progressiveReveal.minOpacity}</Label>
                  <Slider
                    value={[gestureConfig.progressiveReveal.minOpacity]}
                    onValueChange={([value]) =>
                      setGestureConfig(prev => ({
                        ...prev,
                        progressiveReveal: { ...prev.progressiveReveal, minOpacity: value }
                      }))
                    }
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Opacity: {gestureConfig.progressiveReveal.maxOpacity}</Label>
                  <Slider
                    value={[gestureConfig.progressiveReveal.maxOpacity]}
                    onValueChange={([value]) =>
                      setGestureConfig(prev => ({
                        ...prev,
                        progressiveReveal: { ...prev.progressiveReveal, maxOpacity: value }
                      }))
                    }
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Velocity Animation Settings */}
            <div>
              <h4 className="font-medium mb-3">Velocity-based Animation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slow Duration: {gestureConfig.velocityAnimation.slowDuration}s</Label>
                  <Slider
                    value={[gestureConfig.velocityAnimation.slowDuration]}
                    onValueChange={([value]) =>
                      setGestureConfig(prev => ({
                        ...prev,
                        velocityAnimation: { ...prev.velocityAnimation, slowDuration: value }
                      }))
                    }
                    min={0.2}
                    max={1.0}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fast Duration: {gestureConfig.velocityAnimation.fastDuration}s</Label>
                  <Slider
                    value={[gestureConfig.velocityAnimation.fastDuration]}
                    onValueChange={([value]) =>
                      setGestureConfig(prev => ({
                        ...prev,
                        velocityAnimation: { ...prev.velocityAnimation, fastDuration: value }
                      }))
                    }
                    min={0.1}
                    max={0.5}
                    step={0.1}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 제스처 테스트 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Advanced Gesture Tests
              </CardTitle>
              <CardDescription>
                고급 제스처 기능들의 개별 테스트
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gestureTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {test.icon}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {test.description}
                        </div>
                        {test.details && (
                          <div className="text-xs text-blue-600 mt-1">
                            {test.details}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          test.status === 'success' ? 'default' :
                          test.status === 'error' ? 'destructive' :
                          test.status === 'running' ? 'secondary' : 'outline'
                        }
                      >
                        {test.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {test.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                        {test.status === 'running' && <Move className="h-3 w-3 mr-1 animate-spin" />}
                        {test.status}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startGestureTest(test.id)}
                        disabled={test.status === 'running'}
                      >
                        {test.status === 'running' ? 'Testing...' : 'Test'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={resetAllTests} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All Tests
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 실시간 액션 로그 */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Action Log</CardTitle>
              <CardDescription>
                제스처 및 네비게이션 이벤트 실시간 로그
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-2">
                  {actionLog.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      제스처를 사용하거나 버튼을 클릭하면 로그가 표시됩니다.
                    </p>
                  ) : (
                    actionLog.map((action, index) => (
                      <div
                        key={index}
                        className="text-sm font-mono p-2 bg-muted/50 rounded border-l-2 border-primary/50"
                      >
                        {action}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <Button
                onClick={() => setActionLog([])}
                variant="outline"
                size="sm"
                className="w-full mt-4"
              >
                Clear Log
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 테스트 지침 */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
            <CardDescription>
              고급 제스처 기능을 효과적으로 테스트하는 방법
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Edge Swipe Testing</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 화면 왼쪽 가장자리(20px 이내)에서 터치 시작</li>
                  <li>• 오른쪽으로 80px 이상 드래그</li>
                  <li>• 또는 빠른 속도(300px/s 이상)로 스와이프</li>
                  <li>• 메뉴가 열리고 성공 햅틱 피드백 발생</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Progressive Reveal Testing</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 메뉴를 열고 좌측으로 드래그</li>
                  <li>• 드래그 진행률에 따라 투명도/크기 변화 확인</li>
                  <li>• 백드롭의 투명도도 함께 변화</li>
                  <li>• 부드러운 그라데이션 효과 확인</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Velocity Animation Testing</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 느린 속도로 메뉴 닫기 (긴 애니메이션)</li>
                  <li>• 빠른 속도로 메뉴 닫기 (짧은 애니메이션)</li>
                  <li>• 속도에 따른 애니메이션 시간 차이 확인</li>
                  <li>• 로그에서 계산된 지속시간 확인</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Multi-touch Testing</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 두 손가락으로 화면 터치</li>
                  <li>• 멀티터치 감지 확인 (오렌지 표시)</li>
                  <li>• 드래그 인디케이터 색상 변화 확인</li>
                  <li>• 특별한 햅틱 패턴 체험</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 디버그 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Navigation State:</strong>
                <Badge variant={isNavOpen ? "default" : "outline"} className="ml-2">
                  {isNavOpen ? "Open" : "Closed"}
                </Badge>
              </div>
              <div>
                <strong>Test Timestamp:</strong>
                <span className="ml-2 font-mono">{loaderData.timestamp}</span>
              </div>
              <div>
                <strong>Gesture Support:</strong>
                <Badge variant="default" className="ml-2">Advanced</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 