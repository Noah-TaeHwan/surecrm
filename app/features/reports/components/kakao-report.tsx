import { useState, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Textarea } from '~/common/components/ui/textarea';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import {
  Copy,
  Check,
  MessageCircle,
  Clock,
  Users,
  Phone,
  CalendarDays,
  Target,
  TrendingUp,
  Plus,
  Minus,
} from 'lucide-react';
import type { KakaoReportProps, KakaoReportData } from './types';

export function KakaoReport({ performance }: KakaoReportProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [kakaoReport, setKakaoReport] = useState<KakaoReportData>({
    startTime: '09:00',
    endTime: '18:00',
    activities: '고객 상담 및 신규 개발',
    newClients: 2,
    meetings: 3,
    calls: 5,
    tomorrowPlan: '신규 고객 미팅 2건',
    notes: '',
  });
  const [userName, setUserName] = useState('김영희');

  // 미리보기 텍스트를 별도 상태로 관리
  const [previewText, setPreviewText] = useState('');

  const generateKakaoReport = () => {
    const today = new Date();
    const dateString = today.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    return `📅 ${dateString}
👤 보고자: ${userName}

📋 일일 업무 보고서

⏰ 근무시간: ${kakaoReport.startTime} ~ ${kakaoReport.endTime}

📊 오늘의 성과
• 신규 고객: ${kakaoReport.newClients}명
• 고객 미팅: ${kakaoReport.meetings}건
• 상담 전화: ${kakaoReport.calls}건
• 주요 활동: ${kakaoReport.activities}

📈 누적 현황
• 총 고객 수: ${performance.totalClients}명
• 이번 달 신규: ${performance.newClients}명
• 계약 전환율: ${performance.conversionRate}%

📝 내일 계획
${kakaoReport.tomorrowPlan}

${kakaoReport.notes ? `💬 특이사항\n${kakaoReport.notes}` : ''}

#업무보고 #SureCRM`;
  };

  const generateWeeklyReport = () => {
    const thisWeek = new Date().toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });

    return `📊 주간 업무 요약 보고서

📅 ${thisWeek} 주간
👤 작성자: ${userName}
⭐ 이번 주 하이라이트

📈 주요 성과
• 총 신규 고객: ${kakaoReport.newClients * 5}명
• 주간 미팅: ${kakaoReport.meetings * 5}건  
• 상담 전화: ${kakaoReport.calls * 5}건
• 계약 성사: ${Math.round(kakaoReport.newClients * 0.7)}건

🎯 목표 달성률
• 신규 고객: 85% (목표 대비)
• 미팅 횟수: 92% (목표 대비)
• 전환율: ${performance.conversionRate}%

💡 다음 주 전략
• 기존 고객 관리 강화
• 신규 채널 개발
• 팀 협업 증대

#주간보고 #SureCRM`;
  };

  const generateMonthlyReport = () => {
    const thisMonth = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });

    return `📈 월간 성과 보고서

📅 ${thisMonth}
👤 작성자: ${userName}
🏆 월간 종합 성과

💼 비즈니스 성과
• 총 고객 수: ${performance.totalClients}명
• 이번 달 신규: ${performance.newClients}명
• 총 수익: ${(performance.revenue / 10000000).toFixed(1)}천만원
• 전환율: ${performance.conversionRate}%

📊 성장률
• 고객 증가: +${performance.growth.clients}%
• 수익 증가: +${performance.growth.revenue}%
• 소개 증가: +${performance.growth.referrals}%

🎯 다음 달 목표
• 신규 고객 35명 확보
• 전환율 70% 달성
• 수익 1.8억원 목표

#월간보고 #성과분석 #SureCRM`;
  };

  // 입력값이 변경될 때마다 미리보기 업데이트
  useEffect(() => {
    setPreviewText(generateKakaoReport());
  }, [kakaoReport, performance, userName]);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 숫자 증감 핸들러
  const handleNumberChange = (field: keyof KakaoReportData, value: number) => {
    setKakaoReport((prev) => ({
      ...prev,
      [field]: Math.max(0, value),
    }));
  };

  // 개선된 숫자 입력 컴포넌트
  const NumberInput = ({
    label,
    value,
    field,
    icon: Icon,
  }: {
    label: string;
    value: number;
    field: keyof KakaoReportData;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) =>
            handleNumberChange(field, parseInt(e.target.value) || 0)
          }
          className="h-10 w-full text-center font-medium bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-8 pl-8"
          min="0"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
          onClick={() => handleNumberChange(field, value - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
          onClick={() => handleNumberChange(field, value + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  // 개선된 시간 입력 컴포넌트
  const TimeInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => {
    const [hour, minute] = value.split(':');
    const [hourInput, setHourInput] = useState(hour);
    const [minuteInput, setMinuteInput] = useState(minute);

    // 시간이 외부에서 변경되면 로컬 상태도 업데이트
    useEffect(() => {
      const [h, m] = value.split(':');
      setHourInput(h);
      setMinuteInput(m);
    }, [value]);

    const handleHourChange = (newHour: string) => {
      // 로컬 상태만 업데이트, 부모 상태는 onBlur에서만 업데이트
      setHourInput(newHour);
    };

    const handleHourBlur = () => {
      const h = Math.max(0, Math.min(23, parseInt(hourInput) || 0));
      const formattedHour = h.toString().padStart(2, '0');
      setHourInput(formattedHour);
      onChange(`${formattedHour}:${minute}`);
    };

    const handleMinuteChange = (newMinute: string) => {
      // 로컬 상태만 업데이트, 부모 상태는 onBlur에서만 업데이트
      setMinuteInput(newMinute);
    };

    const handleMinuteBlur = () => {
      const m = Math.max(0, Math.min(59, parseInt(minuteInput) || 0));
      const formattedMinute = m.toString().padStart(2, '0');
      setMinuteInput(formattedMinute);
      onChange(`${hour}:${formattedMinute}`);
    };

    return (
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={hourInput}
              onChange={(e) => handleHourChange(e.target.value)}
              onBlur={handleHourBlur}
              className="h-10 w-full text-center font-medium bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              max="23"
              placeholder="09"
            />
          </div>
          <span className="text-muted-foreground font-bold text-lg">:</span>
          <div className="relative flex-1">
            <input
              type="number"
              value={minuteInput}
              onChange={(e) => handleMinuteChange(e.target.value)}
              onBlur={handleMinuteBlur}
              className="h-10 w-full text-center font-medium bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              max="59"
              placeholder="00"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <CardTitle>카카오톡 업무 보고</CardTitle>
        </div>
        <CardDescription>
          업무 정보를 입력하고 다양한 형태의 보고서를 생성하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">일일 보고</TabsTrigger>
            <TabsTrigger value="weekly">주간 요약</TabsTrigger>
            <TabsTrigger value="monthly">월간 성과</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            {/* 2열 레이아웃: 왼쪽 입력, 오른쪽 미리보기 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 왼쪽: 입력 영역 */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <h4 className="text-sm font-semibold">입력 정보</h4>
                </div>

                {/* 작성자 정보 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">작성자</Label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="h-10"
                  />
                </div>

                {/* 성과 지표 섹션 */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Target className="h-4 w-4" />
                    오늘의 성과
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <NumberInput
                      label="신규 고객"
                      value={kakaoReport.newClients}
                      field="newClients"
                      icon={Users}
                    />
                    <NumberInput
                      label="미팅"
                      value={kakaoReport.meetings}
                      field="meetings"
                      icon={CalendarDays}
                    />
                    <NumberInput
                      label="상담전화"
                      value={kakaoReport.calls}
                      field="calls"
                      icon={Phone}
                    />
                  </div>
                </div>

                {/* 근무 시간 섹션 */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Clock className="h-4 w-4" />
                    근무 시간
                  </div>

                  <div className="flex items-center gap-3">
                    <TimeInput
                      label="시작"
                      value={kakaoReport.startTime}
                      onChange={(value) =>
                        setKakaoReport((prev) => ({
                          ...prev,
                          startTime: value,
                        }))
                      }
                    />

                    <div className="text-muted-foreground text-lg font-bold pt-6">
                      ~
                    </div>

                    <TimeInput
                      label="종료"
                      value={kakaoReport.endTime}
                      onChange={(value) =>
                        setKakaoReport((prev) => ({
                          ...prev,
                          endTime: value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* 활동 상세 섹션 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">주요 활동</Label>
                    <Input
                      value={kakaoReport.activities}
                      onChange={(e) =>
                        setKakaoReport((prev) => ({
                          ...prev,
                          activities: e.target.value,
                        }))
                      }
                      placeholder="고객 상담 및 신규 개발"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">내일 계획</Label>
                    <Input
                      value={kakaoReport.tomorrowPlan}
                      onChange={(e) =>
                        setKakaoReport((prev) => ({
                          ...prev,
                          tomorrowPlan: e.target.value,
                        }))
                      }
                      placeholder="신규 고객 미팅 2건"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">특이사항</Label>
                    <Textarea
                      value={kakaoReport.notes}
                      onChange={(e) =>
                        setKakaoReport((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="특별한 성과나 이슈사항이 있다면 입력하세요 (선택사항)"
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 오른쪽: 미리보기 및 편집 영역 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <h4 className="text-sm font-semibold">미리보기 및 편집</h4>
                  </div>
                  <Button
                    onClick={handleCopyReport}
                    size="sm"
                    disabled={isCopied}
                    className="min-w-[100px]"
                  >
                    {isCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        복사하기
                      </>
                    )}
                  </Button>
                </div>

                <Textarea
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="min-h-[480px] text-sm font-mono whitespace-pre-wrap resize-none border-dashed"
                  placeholder="생성된 보고서가 여기에 표시됩니다..."
                />

                <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  💡 미리보기 텍스트를 직접 수정할 수 있습니다
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <h4 className="text-sm font-semibold">주간 요약 정보</h4>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm mb-2">
                    일일 입력 데이터를 기반으로 주간 보고서를 자동 생성합니다.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    • 주간 누적 성과 계산
                  </p>
                  <p className="text-xs text-muted-foreground">
                    • 목표 달성률 분석
                  </p>
                  <p className="text-xs text-muted-foreground">
                    • 다음 주 전략 제안
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">주간 보고서</h4>
                  <Button
                    onClick={() =>
                      navigator.clipboard.writeText(generateWeeklyReport())
                    }
                    size="sm"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    복사하기
                  </Button>
                </div>

                <Textarea
                  value={generateWeeklyReport()}
                  readOnly
                  className="min-h-[400px] text-sm font-mono whitespace-pre-wrap resize-none"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <h4 className="text-sm font-semibold">월간 성과 분석</h4>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm mb-2">
                    전체 성과 데이터를 종합하여 월간 보고서를 생성합니다.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    • 월간 종합 성과 요약
                  </p>
                  <p className="text-xs text-muted-foreground">
                    • 성장률 및 트렌드 분석
                  </p>
                  <p className="text-xs text-muted-foreground">
                    • 다음 달 목표 설정
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">월간 보고서</h4>
                  <Button
                    onClick={() =>
                      navigator.clipboard.writeText(generateMonthlyReport())
                    }
                    size="sm"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    복사하기
                  </Button>
                </div>

                <Textarea
                  value={generateMonthlyReport()}
                  readOnly
                  className="min-h-[400px] text-sm font-mono whitespace-pre-wrap resize-none"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
