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
import { Badge } from '~/common/components/ui/badge';
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
  Award,
  AlertCircle,
} from 'lucide-react';
import type { KakaoReportProps, KakaoReportData } from '../types';

export function KakaoReport({ performance }: KakaoReportProps) {
  const [isCopied, setIsCopied] = useState<{ [key: string]: boolean }>({});
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

    // 작업 효율성 계산
    const workHours = calculateWorkHours(
      kakaoReport.startTime,
      kakaoReport.endTime
    );
    const clientsPerHour =
      workHours > 0 ? (kakaoReport.newClients / workHours).toFixed(1) : '0';

    return `📅 ${dateString}
👤 보고자: ${userName}

📋 일일 업무 보고서

⏰ 근무시간: ${kakaoReport.startTime} ~ ${
      kakaoReport.endTime
    } (${workHours}시간)

📊 오늘의 성과
• 신규 고객: ${kakaoReport.newClients}명 (시간당 ${clientsPerHour}명)
• 고객 미팅: ${kakaoReport.meetings}건
• 상담 전화: ${kakaoReport.calls}건
• 주요 활동: ${kakaoReport.activities}

📈 누적 현황 (이번 달)
• 총 고객 수: ${performance.totalClients}명
• 신규 고객: ${performance.newClients}명 
• 계약 전환율: ${performance.conversionRate}%
• 소개 건수: ${performance.totalReferrals}건

🎯 성과 분석
• 고객 증가율: ${performance.growth.clients > 0 ? '+' : ''}${
      performance.growth.clients
    }%
• 수익 증가율: ${performance.growth.revenue > 0 ? '+' : ''}${
      performance.growth.revenue
    }%
${
  performance.conversionRate >= 70
    ? '• 🏆 전환율 우수!'
    : performance.conversionRate >= 50
    ? '• ✅ 전환율 양호'
    : '• ⚠️ 전환율 개선 필요'
}

📝 내일 계획
${kakaoReport.tomorrowPlan}

${kakaoReport.notes ? `💬 특이사항\n${kakaoReport.notes}` : ''}

#업무보고 #SureCRM #보험설계사`;
  };

  const generateWeeklyReport = () => {
    const thisWeek = getWeekRange();
    const weeklyNewClients = kakaoReport.newClients * 5; // 5일 기준
    const weeklyMeetings = kakaoReport.meetings * 5;
    const weeklyCalls = kakaoReport.calls * 5;

    return `📊 주간 업무 요약 보고서

📅 ${thisWeek}
👤 작성자: ${userName}
⭐ 주간 하이라이트

📈 주요 성과
• 총 신규 고객: ${weeklyNewClients}명 (일평균 ${kakaoReport.newClients}명)
• 주간 미팅: ${weeklyMeetings}건  
• 상담 전화: ${weeklyCalls}건
• 계약 성사: ${Math.round(
      weeklyNewClients * (performance.conversionRate / 100)
    )}건

🎯 목표 달성률
• 신규 고객: ${Math.round((weeklyNewClients / 25) * 100)}% (주간 목표 25명 기준)
• 전환율: ${performance.conversionRate}% (목표 60% 기준)
• 미팅 효율: ${((weeklyNewClients / weeklyMeetings) * 100).toFixed(1)}%

📊 성장 지표
• 고객 증가: ${performance.growth.clients > 0 ? '+' : ''}${
      performance.growth.clients
    }%
• 수익 증가: ${performance.growth.revenue > 0 ? '+' : ''}${
      performance.growth.revenue
    }%
• 소개 증가: ${performance.growth.referrals > 0 ? '+' : ''}${
      performance.growth.referrals
    }%

💡 다음 주 전략
• 기존 고객 관리 강화 (재계약 유도)
• 신규 채널 개발 (온라인 마케팅)
• 팀 협업 증대 (소개 시스템 활용)
• ${performance.conversionRate < 60 ? '전환율 개선 집중' : '고객 확보 확대'}

#주간보고 #성과분석 #SureCRM`;
  };

  const generateMonthlyReport = () => {
    const thisMonth = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });

    const monthlyGoalClients = 50; // 월간 목표
    const achievementRate = (
      (performance.newClients / monthlyGoalClients) *
      100
    ).toFixed(1);

    return `📈 월간 성과 보고서

📅 ${thisMonth}
👤 작성자: ${userName}
🏆 월간 종합 성과

💼 비즈니스 성과
• 총 고객 수: ${performance.totalClients.toLocaleString()}명
• 이번 달 신규: ${performance.newClients}명 (목표달성률: ${achievementRate}%)
• 총 수익: ${(performance.revenue / 100000000).toFixed(1)}억원
• 계약 전환율: ${performance.conversionRate}%
• 소개 건수: ${performance.totalReferrals}건

📊 성장률 분석
• 고객 증가: ${performance.growth.clients > 0 ? '+' : ''}${
      performance.growth.clients
    }%
• 수익 증가: ${performance.growth.revenue > 0 ? '+' : ''}${
      performance.growth.revenue
    }%
• 소개 증가: ${performance.growth.referrals > 0 ? '+' : ''}${
      performance.growth.referrals
    }%

🎯 성과 등급
${getPerformanceGrade(performance)}

🚀 다음 달 목표
• 신규 고객 ${Math.max(monthlyGoalClients, performance.newClients + 5)}명 확보
• 전환율 ${Math.min(85, performance.conversionRate + 5)}% 달성
• 수익 ${((performance.revenue * 1.15) / 100000000).toFixed(1)}억원 목표
• 소개 네트워크 확장

💡 개선 포인트
${getImprovementSuggestions(performance)}

#월간보고 #성과분석 #목표설정 #SureCRM`;
  };

  // 헬퍼 함수들
  const calculateWorkHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startTotal = startHour + startMin / 60;
    const endTotal = endHour + endMin / 60;
    return Math.round((endTotal - startTotal) * 10) / 10;
  };

  const getWeekRange = (): string => {
    const today = new Date();
    const monday = new Date(
      today.setDate(today.getDate() - today.getDay() + 1)
    );
    const friday = new Date(today.setDate(monday.getDate() + 4));

    return `${monday.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    })} ~ ${friday.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    })}`;
  };

  const getPerformanceGrade = (perf: any): string => {
    const score =
      perf.conversionRate * 0.4 +
      perf.growth.revenue * 0.3 +
      perf.growth.clients * 0.3;

    if (score >= 80) return '🏆 S등급 (탁월한 성과)';
    if (score >= 60) return '🥇 A등급 (우수한 성과)';
    if (score >= 40) return '🥈 B등급 (양호한 성과)';
    if (score >= 20) return '🥉 C등급 (개선 필요)';
    return '📈 D등급 (집중 관리 필요)';
  };

  const getImprovementSuggestions = (perf: any): string => {
    const suggestions: string[] = [];

    if (perf.conversionRate < 50) {
      suggestions.push('• 고객 상담 프로세스 개선');
    }
    if (perf.growth.clients < 10) {
      suggestions.push('• 신규 고객 개발 채널 다양화');
    }
    if (perf.totalReferrals < 20) {
      suggestions.push('• 기존 고객 소개 시스템 활성화');
    }
    if (perf.growth.revenue < 15) {
      suggestions.push('• 고객 단가 상승 전략 수립');
    }

    return suggestions.length > 0
      ? suggestions.join('\n')
      : '• 현재 성과 수준 유지 및 지속적 성장';
  };

  // 입력값이 변경될 때마다 미리보기 업데이트
  useEffect(() => {
    setPreviewText(generateKakaoReport());
  }, [kakaoReport, performance, userName]);

  const handleCopyReport = async (reportType: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied((prev) => ({ ...prev, [reportType]: true }));
      setTimeout(() => {
        setIsCopied((prev) => ({ ...prev, [reportType]: false }));
      }, 2000);
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
          className="absolute right-0 top-0 h-10 w-8 p-0 hover:bg-muted"
          onClick={() => handleNumberChange(field, value + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute left-0 top-0 h-10 w-8 p-0 hover:bg-muted"
          onClick={() => handleNumberChange(field, value - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  // 시간 입력 컴포넌트
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

    const handleHourChange = (newHour: string) => {
      const validHour = Math.max(0, Math.min(23, parseInt(newHour) || 0));
      onChange(`${validHour.toString().padStart(2, '0')}:${minute}`);
    };

    const handleHourBlur = () => {
      const validHour = Math.max(0, Math.min(23, parseInt(hour) || 0));
      onChange(`${validHour.toString().padStart(2, '0')}:${minute}`);
    };

    const handleMinuteChange = (newMinute: string) => {
      const validMinute = Math.max(0, Math.min(59, parseInt(newMinute) || 0));
      onChange(`${hour}:${validMinute.toString().padStart(2, '0')}`);
    };

    const handleMinuteBlur = () => {
      const validMinute = Math.max(0, Math.min(59, parseInt(minute) || 0));
      onChange(`${hour}:${validMinute.toString().padStart(2, '0')}`);
    };

    return (
      <div className="space-y-2 flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={parseInt(hour)}
            onChange={(e) => handleHourChange(e.target.value)}
            onBlur={handleHourBlur}
            className="h-10 w-12 text-center font-medium bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            max="23"
          />
          <span className="text-muted-foreground">:</span>
          <input
            type="number"
            value={parseInt(minute)}
            onChange={(e) => handleMinuteChange(e.target.value)}
            onBlur={handleMinuteBlur}
            className="h-10 w-12 text-center font-medium bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            max="59"
          />
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
          <Badge variant="secondary" className="text-xs">
            MVP 특화
          </Badge>
        </div>
        <CardDescription>
          보험설계사를 위한 실용적인 업무 보고서를 생성하고 복사하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="text-sm">
              일일 보고
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-sm">
              주간 요약
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-sm">
              월간 성과
            </TabsTrigger>
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
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-4 border border-blue-200">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-900">오늘의 성과</span>
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

                  <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    💡 총 근무시간:{' '}
                    {calculateWorkHours(
                      kakaoReport.startTime,
                      kakaoReport.endTime
                    )}
                    시간
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
                    onClick={() => handleCopyReport('daily', previewText)}
                    size="sm"
                    disabled={isCopied['daily']}
                    className="min-w-[100px]"
                  >
                    {isCopied['daily'] ? (
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

                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 text-xs font-medium">
                    <Award className="h-3 w-3" />
                    MVP 특화 기능
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    💡 미리보기 텍스트를 직접 수정 가능 • 자동 효율성 계산 •
                    성과 등급 표시
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="text-sm font-semibold">주간 요약 정보</h4>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm mb-2 text-purple-900 font-medium">
                    일일 입력 데이터를 기반으로 주간 보고서를 자동 생성합니다.
                  </p>
                  <div className="space-y-1 text-xs text-purple-700">
                    <p>• 주간 누적 성과 자동 계산</p>
                    <p>• 목표 달성률 분석</p>
                    <p>• 성장 지표 모니터링</p>
                    <p>• 다음 주 개선 전략 제안</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">주간 보고서</h4>
                  <Button
                    onClick={() =>
                      handleCopyReport('weekly', generateWeeklyReport())
                    }
                    size="sm"
                    disabled={isCopied['weekly']}
                  >
                    {isCopied['weekly'] ? (
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
                  <Target className="h-5 w-5 text-orange-600" />
                  <h4 className="text-sm font-semibold">월간 성과 분석</h4>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm mb-2 text-orange-900 font-medium">
                    월간 종합 성과를 분석하고 다음 달 목표를 설정합니다.
                  </p>
                  <div className="space-y-1 text-xs text-orange-700">
                    <p>• 성과 등급 자동 산정</p>
                    <p>• 목표 달성률 상세 분석</p>
                    <p>• 개선 포인트 맞춤 제안</p>
                    <p>• 다음 달 목표 자동 설정</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">월간 성과 보고서</h4>
                  <Button
                    onClick={() =>
                      handleCopyReport('monthly', generateMonthlyReport())
                    }
                    size="sm"
                    disabled={isCopied['monthly']}
                  >
                    {isCopied['monthly'] ? (
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
