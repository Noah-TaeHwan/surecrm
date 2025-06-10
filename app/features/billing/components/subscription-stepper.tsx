import { Check, Circle, Clock } from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';

interface Step {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface SubscriptionStepperProps {
  currentStep: 'plan' | 'info' | 'payment' | 'complete';
}

export function SubscriptionStepper({ currentStep }: SubscriptionStepperProps) {
  const getStepStatus = (stepId: string): Step['status'] => {
    const stepOrder = ['plan', 'info', 'payment', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const steps: Step[] = [
    {
      id: 'plan',
      title: '플랜 선택',
      description: '적합한 구독 플랜을 선택하세요',
      estimatedTime: '1분',
      status: getStepStatus('plan'),
    },
    {
      id: 'info',
      title: '정보 입력',
      description: '기본 정보를 입력해주세요',
      estimatedTime: '2분',
      status: getStepStatus('info'),
    },
    {
      id: 'payment',
      title: '결제 진행',
      description: '안전한 결제를 진행합니다',
      estimatedTime: '1분',
      status: getStepStatus('payment'),
    },
    {
      id: 'complete',
      title: '구독 완료',
      description: '구독이 성공적으로 완료되었습니다',
      estimatedTime: '완료',
      status: getStepStatus('complete'),
    },
  ];

  const completedSteps = steps.filter(
    (step) => step.status === 'completed'
  ).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* 전체 진행률 */}
      <div className="text-center space-y-3">
        <h2 className="text-lg font-semibold">구독 설정 진행 상황</h2>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            약{' '}
            {steps.find((s) => s.status === 'current')?.estimatedTime || '완료'}{' '}
            남음
          </span>
          <span>•</span>
          <span>
            {completedSteps}/{totalSteps} 단계 완료
          </span>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-full max-w-md mx-auto">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 단계별 스테퍼 */}
      <div className="relative">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* 단계 아이콘 */}
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${
                      step.status === 'completed'
                        ? 'bg-green-500 text-white shadow-lg'
                        : step.status === 'current'
                        ? 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                  >
                    {step.status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : step.status === 'current' ? (
                      <Circle className="w-5 h-5 fill-current" />
                    ) : (
                      <span>{index + 1}</span>
                    )}

                    {/* 펄싱 효과 (현재 단계) */}
                    {step.status === 'current' && (
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                    )}
                  </div>

                  {/* 단계 정보 */}
                  <div className="text-center min-w-0">
                    <div
                      className={`text-xs font-medium truncate ${
                        step.status === 'current'
                          ? 'text-foreground'
                          : step.status === 'completed'
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-20">
                      {step.description}
                    </div>
                    {step.status === 'current' && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {step.estimatedTime}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 연결선 */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${
                      steps[index + 1].status === 'completed' ||
                      step.status === 'completed'
                        ? 'bg-green-500'
                        : step.status === 'current'
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 현재 단계 안내 */}
      {currentStep !== 'complete' && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Circle className="w-4 h-4 fill-current" />
            {steps.find((s) => s.status === 'current')?.title} 진행 중
          </div>
        </div>
      )}
    </div>
  );
}
