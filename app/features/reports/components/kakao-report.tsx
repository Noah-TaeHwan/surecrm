import { useState, useEffect, useRef } from 'react';
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
import React from 'react';

export function KakaoReport({ performance, user }: KakaoReportProps) {
  const [copiedStates, setCopiedStates] = useState<{
    [key: string]: boolean;
  }>({});

  const [reportData, setReportData] = useState<KakaoReportData>({
    workStartTime: '09:00',
    workEndTime: '18:00',
    clientMeetings: 0,
    phoneCalls: 0,
    quotations: 0,
    contracts: 0,
    referrals: 0,
    prospects: 0,
    followUps: 0,
    adminTasks: 0,
  });

  const userName = user?.name || '사용자';

  const generateKakaoReport = () => {
    const workHours = calculateWorkHours(
      reportData.workStartTime,
      reportData.workEndTime
    );

    return `📊 일일 업무 보고서 - ${userName}님
⏰ 근무시간: ${reportData.workStartTime} ~ ${
      reportData.workEndTime
    } (${workHours}시간)

👥 고객 업무:
• 고객 미팅: ${reportData.clientMeetings}건
• 전화 상담: ${reportData.phoneCalls}건  
• 견적 제안: ${reportData.quotations}건
• 계약 성사: ${reportData.contracts}건

🔗 네트워킹:
• 신규 소개: ${reportData.referrals}건
• 잠재 고객: ${reportData.prospects}건
• 후속 관리: ${reportData.followUps}건

📋 기타 업무: ${reportData.adminTasks}건

${getPerformanceGrade(performance)} ${getImprovementSuggestions(performance)}

#SureCRM #업무보고 #보험설계사 #${userName}`;
  };

  const generateWeeklyReport = () => {
    const weekRange = getWeekRange();
    const totalClients = performance.totalClients || 0;
    const newClients = performance.newClients || 0;
    const conversionRate = performance.conversionRate || 0;

    return `📈 주간 성과 보고서 ${weekRange} - ${userName}님

🎯 주요 성과:
• 총 관리 고객: ${totalClients}명
• 신규 고객: ${newClients}명  
• 전환율: ${conversionRate.toFixed(1)}%
• 주간 매출: ${(performance.revenue || 0).toLocaleString()}원

📊 상세 활동:
• 고객 미팅: ${reportData.clientMeetings * 5}건 (주간)
• 전화 상담: ${reportData.phoneCalls * 5}건
• 제안서: ${reportData.quotations * 5}건
• 성사 계약: ${reportData.contracts * 5}건

🔥 이번 주 하이라이트:
• 신규 소개 네트워크 확장 
• 기존 고객 만족도 관리
• 신상품 제안 및 상담

💪 다음 주 목표:
• 신규 고객 ${Math.ceil(newClients * 1.2)}명 목표
• 전환율 ${(conversionRate + 5).toFixed(1)}% 달성
• 팀 협업 강화

#주간보고 #성과관리 #SureCRM #${userName}`;
  };

  const generateMonthlyReport = () => {
    const totalRevenue = performance.revenue || 0;
    const averageClientValue = performance.averageClientValue || 0;

    return `🏆 이번 달 월간 성과 리포트 - ${userName}님

💎 핵심 성과 지표:
• 총 매출: ${totalRevenue.toLocaleString()}원
• 고객당 평균 매출: ${averageClientValue.toLocaleString()}원
• 월간 신규 고객: ${performance.newClients || 0}명
• 추천 네트워크: ${performance.totalReferrals || 0}건

📈 성장 지표:
• 고객 증가율: ${performance.growth?.clients || 0}%
• 매출 증가율: ${performance.growth?.revenue || 0}%
• 추천 증가율: ${performance.growth?.referrals || 0}%

🎯 월간 활동 요약:
• 총 미팅: ${reportData.clientMeetings * 20}회
• 전화 상담: ${reportData.phoneCalls * 20}회
• 제안/견적: ${reportData.quotations * 20}건
• 계약 성사: ${reportData.contracts * 20}건

🏅 특별 성과:
${
  averageClientValue > 1000000
    ? '• 고액 고객 유치 성공'
    : '• 꾸준한 고객 관리 실천'
}
${
  (performance.growth?.revenue || 0) > 10
    ? '• 매출 목표 초과 달성'
    : '• 안정적 성과 유지'
}

👀 다음 달 전략:
• 고객 만족도 극대화
• 신규 상품 라인업 확대  
• 디지털 마케팅 강화

#월간보고 #성과분석 #목표달성 #SureCRM #${userName}`;
  };

  const calculateWorkHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.round(((endMinutes - startMinutes) / 60) * 10) / 10;
  };

  const getWeekRange = (): string => {
    return '(이번 주)';
  };

  const getPerformanceGrade = (perf: any): string => {
    const conversionRate = perf.conversionRate || 0;
    if (conversionRate >= 15) return '🌟 우수한 성과를 거두고 있습니다!';
    if (conversionRate >= 10) return '👍 양호한 실적을 유지하고 있습니다.';
    if (conversionRate >= 5) return '📈 꾸준한 개선이 필요합니다.';
    return '💪 더 적극적인 영업 활동이 필요합니다.';
  };

  const getImprovementSuggestions = (perf: any): string => {
    const suggestions = [];
    if ((perf.conversionRate || 0) < 10) {
      suggestions.push('• 고객 니즈 분석 강화');
    }
    if ((perf.totalReferrals || 0) < 5) {
      suggestions.push('• 추천 네트워크 확대');
    }
    if ((perf.averageClientValue || 0) < 500000) {
      suggestions.push('• 상품 포트폴리오 다양화');
    }

    return suggestions.length > 0
      ? `\n🎯 개선 포인트:\n${suggestions.join('\n')}`
      : '\n✨ 모든 지표가 우수합니다!';
  };

  const handleCopyReport = async (reportType: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [reportType]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [reportType]: false });
      }, 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const handleNumberChange = (field: keyof KakaoReportData, value: number) => {
    setReportData((prev) => ({
      ...prev,
      [field]: Math.max(0, value),
    }));
  };

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
  }) => {
    const [localValue, setLocalValue] = useState(value.toString());

    // value prop이 변경되면 localValue도 업데이트 (외부 버튼 클릭 시)
    useEffect(() => {
      setLocalValue(value.toString());
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue); // 로컬 상태만 업데이트 (포커스 유지)
    };

    const handleBlur = () => {
      // 포커스가 벗어날 때만 실제 상태 업데이트
      if (localValue === '') {
        handleNumberChange(field, 0);
      } else {
        const parsedValue = parseInt(localValue) || 0;
        const finalValue = Math.max(0, parsedValue);
        handleNumberChange(field, finalValue);
      }
    };

    const handleButtonClick = (newValue: number) => {
      handleNumberChange(field, newValue);
    };

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleButtonClick(value - 1)}
            disabled={value <= 0}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="text-center h-8 w-16"
            min="0"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleButtonClick(value + 1)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

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
    const [localHour, setLocalHour] = useState(hour);
    const [localMinute, setLocalMinute] = useState(minute);

    // value prop이 변경되면 로컬 상태도 업데이트
    useEffect(() => {
      const [newHour, newMinute] = value.split(':');
      setLocalHour(newHour);
      setLocalMinute(newMinute);
    }, [value]);

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newHour = e.target.value;
      setLocalHour(newHour); // 로컬 상태만 업데이트 (포커스 유지)
    };

    const handleHourBlur = () => {
      // 포커스가 벗어날 때만 실제 상태 업데이트
      const validHour = Math.max(0, Math.min(23, parseInt(localHour) || 0));
      const formattedHour = validHour.toString().padStart(2, '0');
      onChange(`${formattedHour}:${minute}`);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMinute = e.target.value;
      setLocalMinute(newMinute); // 로컬 상태만 업데이트 (포커스 유지)
    };

    const handleMinuteBlur = () => {
      // 포커스가 벗어날 때만 실제 상태 업데이트
      const validMinute = Math.max(0, Math.min(59, parseInt(localMinute) || 0));
      const formattedMinute = validMinute.toString().padStart(2, '0');
      onChange(`${hour}:${formattedMinute}`);
    };

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {label}
        </Label>
        <div className="flex items-center space-x-1">
          <Input
            type="number"
            value={parseInt(localHour)}
            onChange={handleHourChange}
            onBlur={handleHourBlur}
            className="text-center h-8 w-12"
            min="0"
            max="23"
          />
          <span className="text-muted-foreground">:</span>
          <Input
            type="number"
            value={parseInt(localMinute)}
            onChange={handleMinuteChange}
            onBlur={handleMinuteBlur}
            className="text-center h-8 w-12"
            min="0"
            max="59"
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-zinc-100 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-400" />
          카카오톡 업무 보고서
        </CardTitle>
        <CardDescription className="text-zinc-400">
          업무 내용을 입력하고 카카오톡용 보고서를 생성하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  근무 시간 설정
                </h3>
                <div className="text-sm text-zinc-400">
                  총 근무시간:{' '}
                  <span className="font-medium text-zinc-200">
                    {calculateWorkHours(
                      reportData.workStartTime,
                      reportData.workEndTime
                    )}
                    시간
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <TimeInput
                  label="시작 시간"
                  value={reportData.workStartTime}
                  onChange={(value) =>
                    setReportData((prev) => ({ ...prev, workStartTime: value }))
                  }
                />
                <TimeInput
                  label="종료 시간"
                  value={reportData.workEndTime}
                  onChange={(value) =>
                    setReportData((prev) => ({ ...prev, workEndTime: value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-400" />
                활동 지표 입력
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <NumberInput
                  label="고객 미팅"
                  value={reportData.clientMeetings}
                  field="clientMeetings"
                  icon={Users}
                />
                <NumberInput
                  label="전화 상담"
                  value={reportData.phoneCalls}
                  field="phoneCalls"
                  icon={Phone}
                />
                <NumberInput
                  label="견적 제안"
                  value={reportData.quotations}
                  field="quotations"
                  icon={CalendarDays}
                />
                <NumberInput
                  label="계약 성사"
                  value={reportData.contracts}
                  field="contracts"
                  icon={Award}
                />
                <NumberInput
                  label="신규 소개"
                  value={reportData.referrals}
                  field="referrals"
                  icon={TrendingUp}
                />
                <NumberInput
                  label="잠재 고객"
                  value={reportData.prospects}
                  field="prospects"
                  icon={AlertCircle}
                />
                <NumberInput
                  label="후속 관리"
                  value={reportData.followUps}
                  field="followUps"
                  icon={Users}
                />
                <NumberInput
                  label="기타 업무"
                  value={reportData.adminTasks}
                  field="adminTasks"
                  icon={CalendarDays}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-400" />
              보고서 미리보기
            </h3>

            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-800/50">
                <TabsTrigger
                  value="daily"
                  className="text-xs data-[state=active]:bg-zinc-700"
                >
                  일일 보고서
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="text-xs data-[state=active]:bg-zinc-700"
                >
                  주간 보고서
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="text-xs data-[state=active]:bg-zinc-700"
                >
                  월간 보고서
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-3 mt-4">
                <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <Textarea
                    value={generateKakaoReport()}
                    readOnly
                    className="min-h-[320px] text-sm font-mono bg-transparent border-none resize-none focus-visible:ring-0 text-zinc-200"
                  />
                </div>
                <Button
                  onClick={() =>
                    handleCopyReport('daily', generateKakaoReport())
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="sm"
                >
                  {copiedStates.daily ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      복사됨!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      일일 보고서 복사
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="weekly" className="space-y-3 mt-4">
                <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <Textarea
                    value={generateWeeklyReport()}
                    readOnly
                    className="min-h-[320px] text-sm font-mono bg-transparent border-none resize-none focus-visible:ring-0 text-zinc-200"
                  />
                </div>
                <Button
                  onClick={() =>
                    handleCopyReport('weekly', generateWeeklyReport())
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {copiedStates.weekly ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      복사됨!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      주간 보고서 복사
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-3 mt-4">
                <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <Textarea
                    value={generateMonthlyReport()}
                    readOnly
                    className="min-h-[320px] text-sm font-mono bg-transparent border-none resize-none focus-visible:ring-0 text-zinc-200"
                  />
                </div>
                <Button
                  onClick={() =>
                    handleCopyReport('monthly', generateMonthlyReport())
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  {copiedStates.monthly ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      복사됨!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      월간 보고서 복사
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
