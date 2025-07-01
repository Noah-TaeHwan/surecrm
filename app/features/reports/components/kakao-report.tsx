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
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { formatCurrencyByUnit } from '~/lib/utils/currency';
import React from 'react';

export function KakaoReport({
  performance,
  user,
  period = 'month',
}: KakaoReportProps) {
  const { t, i18n } = useHydrationSafeTranslation('reports');

  // 🔥 기간에 맞는 텍스트 생성
  const getPeriodText = (periodType: string) => {
    return t(`periods.${periodType}`, '이번 달');
  };

  const periodText = getPeriodText(period);

  // 통일된 통화 포맷팅 함수 사용 (현재 언어 적용)
  const formatCurrency = (amount: number) => {
    const currentLocale = i18n?.language || 'ko';
    const supportedLocale = ['ko', 'en', 'ja'].includes(currentLocale)
      ? (currentLocale as 'ko' | 'en' | 'ja')
      : 'ko';
    return formatCurrencyByUnit(amount, supportedLocale);
  };

  // 🔧 성장률 안전 표시 함수
  const formatGrowthRate = (value: number): string => {
    if (!isFinite(value) || isNaN(value)) {
      return t('growth.newData');
    }
    if (Math.abs(value) >= 500) {
      return value > 0 ? t('growth.majorIncrease') : t('growth.majorDecrease');
    }
    return `${value > 0 ? '+' : ''}${Math.round(value * 10) / 10}%`;
  };
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

  // 🆕 사용자 커스텀 보고서 템플릿 상태
  const [customTemplates, setCustomTemplates] = useState({
    daily: '',
    weekly: '',
    monthly: '',
  });

  // 🆕 편집 모드 상태
  const [editMode, setEditMode] = useState({
    daily: false,
    weekly: false,
    monthly: false,
  });

  // 🆕 저장된 템플릿이 있는지 확인
  const [hasCustomTemplate, setHasCustomTemplate] = useState({
    daily: false,
    weekly: false,
    monthly: false,
  });

  const userName = user?.name || '사용자';

  const generateKakaoReport = () => {
    const workHours = calculateWorkHours(
      reportData.workStartTime,
      reportData.workEndTime
    );

    return `📊 ${t('kakaoReport.templates.daily')} - ${userName}
⏰ ${t('kakaoReport.workTime.title')}: ${reportData.workStartTime} ~ ${
      reportData.workEndTime
    } (${t('kakaoReport.workTime.hours', { hours: workHours })})

👥 ${t('kakaoReport.activities.title')}:
• ${t('kakaoReport.activities.clientMeetings')}: ${reportData.clientMeetings}${t('units.cases')}
• ${t('kakaoReport.activities.phoneCalls')}: ${reportData.phoneCalls}${t('units.cases')}  
• ${t('kakaoReport.activities.quotations')}: ${reportData.quotations}${t('units.cases')}
• ${t('kakaoReport.activities.contracts')}: ${reportData.contracts}${t('units.cases')}

🔗 ${t('kakaoReport.reportContent.networking')}:
• ${t('kakaoReport.activities.referrals')}: ${reportData.referrals}${t('units.cases')}
• ${t('kakaoReport.activities.prospects')}: ${reportData.prospects}${t('units.cases')}
• ${t('kakaoReport.activities.followUps')}: ${reportData.followUps}${t('units.cases')}

📋 ${t('kakaoReport.activities.adminTasks')}: ${reportData.adminTasks}${t('units.cases')}

${getPerformanceGrade(performance)} ${getImprovementSuggestions(performance)}

#SureCRM #${t('kakaoReport.hashtags.workReport')} #${t('kakaoReport.hashtags.insuranceAgent')} #${userName}`;
  };

  const generateWeeklyReport = () => {
    const weekRange = getWeekRange();
    const totalClients = performance.totalClients || 0;
    const newClients = performance.newClients || 0;
    const conversionRate = performance.conversionRate || 0;

    return `📈 ${t('kakaoReport.templates.weekly')} ${weekRange} - ${userName}

🎯 ${t('kakaoReport.reportContent.keyPerformance')}:
• ${t('kakaoReport.reportContent.totalManagement')}: ${totalClients}${t('units.people')}
• ${t('kakaoReport.reportContent.newClients')}: ${newClients}${t('units.people')}  
• ${t('kakaoReport.reportContent.conversionRate')}: ${conversionRate.toFixed(1)}%
• ${t('kakaoReport.reportContent.weeklyRevenue')}: ${formatCurrency(performance.revenue || 0)}

📊 ${t('kakaoReport.reportContent.detailedActivities')}:
• ${t('kakaoReport.activities.clientMeetings')}: ${reportData.clientMeetings * 5}${t('units.cases')} ${t('kakaoReport.reportContent.weeklyPeriod')}
• ${t('kakaoReport.activities.phoneCalls')}: ${reportData.phoneCalls * 5}${t('units.cases')}
• ${t('kakaoReport.reportContent.proposals')}: ${reportData.quotations * 5}${t('units.cases')}
• ${t('kakaoReport.reportContent.successfulContracts')}: ${reportData.contracts * 5}${t('units.cases')}

🔥 ${t('kakaoReport.reportContent.weeklyHighlights')}:
• ${t('kakaoReport.reportContent.networkExpansion')}
• ${t('kakaoReport.reportContent.customerSatisfaction')}
• ${t('kakaoReport.reportContent.newProductConsultation')}

💪 ${t('kakaoReport.reportContent.nextWeekGoals')}:
• ${t('kakaoReport.reportContent.newClients')} ${Math.ceil(newClients * 1.2)}${t('units.people')} ${t('kakaoReport.reportContent.targetGoal')}
• ${t('kakaoReport.reportContent.conversionRate')} ${(conversionRate + 5).toFixed(1)}% ${t('kakaoReport.reportContent.achieve')}
• ${t('kakaoReport.reportContent.teamCollaboration')}

#${t('kakaoReport.hashtags.weeklyReport')} #${t('kakaoReport.hashtags.performanceManagement')} #SureCRM #${userName}`;
  };

  const generateMonthlyReport = () => {
    const totalRevenue = performance.revenue || 0;
    const averageClientValue = performance.averageClientValue || 0;

    return `🏆 ${periodText} ${t('kakaoReport.templates.monthly')} - ${userName}

💎 ${t('kakaoReport.reportContent.coreMetrics')}:
• ${t('kakaoReport.reportContent.totalRevenue')}: ${formatCurrency(totalRevenue)}
• ${t('kakaoReport.reportContent.averageClientRevenue')}: ${formatCurrency(averageClientValue)}
• ${t('kakaoReport.reportContent.monthlyNewClients')}: ${performance.newClients || 0}${t('units.people')}
• ${t('kakaoReport.reportContent.referralNetwork')}: ${performance.totalReferrals || 0}${t('units.cases')}

📈 ${t('kakaoReport.reportContent.growthMetrics')}:
• ${t('growth.clients')}: ${formatGrowthRate(performance.growth?.clients || 0)}
• ${t('growth.revenue')}: ${formatGrowthRate(performance.growth?.revenue || 0)}
• ${t('growth.referrals')}: ${formatGrowthRate(performance.growth?.referrals || 0)}

🎯 ${t('kakaoReport.reportContent.monthlyActivitySummary')}:
• ${t('kakaoReport.reportContent.totalMeetings')}: ${reportData.clientMeetings * 20}${t('units.times')}
• ${t('kakaoReport.activities.phoneCalls')}: ${reportData.phoneCalls * 20}${t('units.times')}
• ${t('kakaoReport.reportContent.proposalsQuotations')}: ${reportData.quotations * 20}${t('units.cases')}
• ${t('kakaoReport.reportContent.contractsClosed')}: ${reportData.contracts * 20}${t('units.cases')}

🏅 ${t('kakaoReport.reportContent.specialAchievements')}:
${
  averageClientValue > 1000000
    ? `• ${t('kakaoReport.reportContent.highValueClientSuccess')}`
    : `• ${t('kakaoReport.reportContent.consistentClientManagement')}`
}
${
  (performance.growth?.revenue || 0) > 10
    ? `• ${t('kakaoReport.reportContent.revenueTargetExceeded')}`
    : `• ${t('kakaoReport.reportContent.stablePerformance')}`
}

👀 ${t('kakaoReport.reportContent.nextMonthStrategy')}:
• ${t('kakaoReport.reportContent.maximizeCustomerSatisfaction')}
• ${t('kakaoReport.reportContent.expandProductLineup')}
• ${t('kakaoReport.reportContent.strengthenDigitalMarketing')}

#${t('kakaoReport.hashtags.monthlyReport')} #${t('kakaoReport.hashtags.performanceAnalysis')} #${t('kakaoReport.hashtags.goalAchievement')} #SureCRM #${userName}`;
  };

  const calculateWorkHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.round(((endMinutes - startMinutes) / 60) * 10) / 10;
  };

  const getWeekRange = (): string => {
    return t('kakaoReport.reportContent.thisWeekRange');
  };

  const getPerformanceGrade = (perf: any): string => {
    const conversionRate = perf.conversionRate || 0;
    if (conversionRate >= 15) return t('kakaoReport.performance.excellent');
    if (conversionRate >= 10) return t('kakaoReport.performance.good');
    if (conversionRate >= 5)
      return t('kakaoReport.performance.needsImprovement');
    return t('kakaoReport.performance.requiresAction');
  };

  const getImprovementSuggestions = (perf: any): string => {
    const suggestions = [];
    if ((perf.conversionRate || 0) < 10) {
      suggestions.push(`• ${t('kakaoReport.suggestions.needsAnalysis')}`);
    }
    if ((perf.totalReferrals || 0) < 5) {
      suggestions.push(`• ${t('kakaoReport.suggestions.expandNetwork')}`);
    }
    if ((perf.averageClientValue || 0) < 500000) {
      suggestions.push(`• ${t('kakaoReport.suggestions.diversifyPortfolio')}`);
    }

    return suggestions.length > 0
      ? `\n${t('kakaoReport.suggestions.title')}\n${suggestions.join('\n')}`
      : `\n${t('kakaoReport.suggestions.allExcellent')}`;
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
    setReportData(prev => ({
      ...prev,
      [field]: Math.max(0, value),
    }));
  };

  // 🆕 템플릿 관리 함수들
  const getReportContent = (type: 'daily' | 'weekly' | 'monthly'): string => {
    if (hasCustomTemplate[type] && customTemplates[type]) {
      return customTemplates[type];
    }

    switch (type) {
      case 'daily':
        return generateKakaoReport();
      case 'weekly':
        return generateWeeklyReport();
      case 'monthly':
        return generateMonthlyReport();
      default:
        return '';
    }
  };

  const handleTemplateEdit = (
    type: 'daily' | 'weekly' | 'monthly',
    content: string
  ) => {
    setCustomTemplates(prev => ({
      ...prev,
      [type]: content,
    }));
  };

  const handleSaveTemplate = (type: 'daily' | 'weekly' | 'monthly') => {
    // 🔥 로컬 스토리지에 저장
    const templateKey = `surecrm_template_${type}_${user?.id || 'default'}`;
    localStorage.setItem(templateKey, customTemplates[type]);

    setHasCustomTemplate(prev => ({
      ...prev,
      [type]: true,
    }));

    setEditMode(prev => ({
      ...prev,
      [type]: false,
    }));

    // 성공 메시지 (간단한 state로 처리)
    setCopiedStates(prev => ({
      ...prev,
      [`saved_${type}`]: true,
    }));

    setTimeout(() => {
      setCopiedStates(prev => ({
        ...prev,
        [`saved_${type}`]: false,
      }));
    }, 2000);
  };

  const handleResetTemplate = (type: 'daily' | 'weekly' | 'monthly') => {
    const templateKey = `surecrm_template_${type}_${user?.id || 'default'}`;
    localStorage.removeItem(templateKey);

    setCustomTemplates(prev => ({
      ...prev,
      [type]: '',
    }));

    setHasCustomTemplate(prev => ({
      ...prev,
      [type]: false,
    }));

    setEditMode(prev => ({
      ...prev,
      [type]: false,
    }));
  };

  // 🆕 컴포넌트 마운트 시 저장된 템플릿 로드
  useEffect(() => {
    const loadSavedTemplates = () => {
      ['daily', 'weekly', 'monthly'].forEach(type => {
        const templateKey = `surecrm_template_${type}_${user?.id || 'default'}`;
        const savedTemplate = localStorage.getItem(templateKey);

        if (savedTemplate) {
          setCustomTemplates(prev => ({
            ...prev,
            [type]: savedTemplate,
          }));

          setHasCustomTemplate(prev => ({
            ...prev,
            [type]: true,
          }));
        }
      });
    };

    loadSavedTemplates();
  }, [user?.id]);

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
          {t('kakaoReport.title')}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {t('kakaoReport.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pt-4">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  {t('kakaoReport.workTime.title')}
                </h3>
                <div className="text-sm text-zinc-400">
                  {t('kakaoReport.workTimeTotal')}:{' '}
                  <span className="font-medium text-zinc-200">
                    {t('kakaoReport.workTime.hours', {
                      hours: calculateWorkHours(
                        reportData.workStartTime,
                        reportData.workEndTime
                      ),
                    })}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <TimeInput
                  label={t('kakaoReport.workTime.start')}
                  value={reportData.workStartTime}
                  onChange={value =>
                    setReportData(prev => ({ ...prev, workStartTime: value }))
                  }
                />
                <TimeInput
                  label={t('kakaoReport.workTime.end')}
                  value={reportData.workEndTime}
                  onChange={value =>
                    setReportData(prev => ({ ...prev, workEndTime: value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-400" />
                {t('kakaoReport.activities.title')}
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <NumberInput
                  label={t('kakaoReport.activities.clientMeetings')}
                  value={reportData.clientMeetings}
                  field="clientMeetings"
                  icon={Users}
                />
                <NumberInput
                  label={t('kakaoReport.activities.phoneCalls')}
                  value={reportData.phoneCalls}
                  field="phoneCalls"
                  icon={Phone}
                />
                <NumberInput
                  label={t('kakaoReport.activities.quotations')}
                  value={reportData.quotations}
                  field="quotations"
                  icon={CalendarDays}
                />
                <NumberInput
                  label={t('kakaoReport.activities.contracts')}
                  value={reportData.contracts}
                  field="contracts"
                  icon={Award}
                />
                <NumberInput
                  label={t('kakaoReport.activities.referrals')}
                  value={reportData.referrals}
                  field="referrals"
                  icon={TrendingUp}
                />
                <NumberInput
                  label={t('kakaoReport.activities.prospects')}
                  value={reportData.prospects}
                  field="prospects"
                  icon={AlertCircle}
                />
                <NumberInput
                  label={t('kakaoReport.activities.followUps')}
                  value={reportData.followUps}
                  field="followUps"
                  icon={Users}
                />
                <NumberInput
                  label={t('kakaoReport.activities.adminTasks')}
                  value={reportData.adminTasks}
                  field="adminTasks"
                  icon={CalendarDays}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-400" />
              {t('kakaoReport.previewTitle')}
            </h3>

            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-800/50">
                <TabsTrigger
                  value="daily"
                  className="text-xs data-[state=active]:bg-zinc-700"
                >
                  {t('kakaoReport.tabs.daily')}
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="text-xs data-[state=active]:bg-zinc-700"
                >
                  {t('kakaoReport.tabs.weekly')}
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="text-xs data-[state=active]:bg-zinc-700"
                >
                  {t('kakaoReport.tabs.monthly')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-3 mt-4">
                <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <Textarea
                    value={
                      editMode.daily
                        ? customTemplates.daily
                        : getReportContent('daily')
                    }
                    onChange={e =>
                      editMode.daily
                        ? handleTemplateEdit('daily', e.target.value)
                        : undefined
                    }
                    readOnly={!editMode.daily}
                    className="min-h-[320px] text-sm font-mono bg-transparent border-none resize-none focus-visible:ring-0 text-zinc-200"
                    placeholder={editMode.daily ? t('buttons.edit') : ''}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      handleCopyReport('daily', getReportContent('daily'))
                    }
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                  >
                    {copiedStates.daily ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {t('kakaoReport.notifications.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        {t('buttons.copy')}
                      </>
                    )}
                  </Button>

                  {!editMode.daily ? (
                    <Button
                      onClick={() => {
                        setEditMode(prev => ({ ...prev, daily: true }));
                        if (!hasCustomTemplate.daily) {
                          setCustomTemplates(prev => ({
                            ...prev,
                            daily: generateKakaoReport(),
                          }));
                        }
                      }}
                      variant="outline"
                      size="default"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 px-4"
                    >
                      {t('buttons.edit')}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSaveTemplate('daily')}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {copiedStates.saved_daily ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {t('kakaoReport.notifications.templateSaved')}
                          </>
                        ) : (
                          t('buttons.saveTemplate')
                        )}
                      </Button>
                      <Button
                        onClick={() =>
                          setEditMode(prev => ({ ...prev, daily: false }))
                        }
                        variant="outline"
                        size="sm"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      >
                        {t('buttons.cancel')}
                      </Button>
                      {hasCustomTemplate.daily && (
                        <Button
                          onClick={() => handleResetTemplate('daily')}
                          variant="destructive"
                          size="sm"
                        >
                          {t('buttons.resetTemplate')}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="space-y-3 mt-4">
                <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <Textarea
                    value={
                      editMode.weekly
                        ? customTemplates.weekly
                        : getReportContent('weekly')
                    }
                    onChange={e =>
                      editMode.weekly
                        ? handleTemplateEdit('weekly', e.target.value)
                        : undefined
                    }
                    readOnly={!editMode.weekly}
                    className="min-h-[320px] text-sm font-mono bg-transparent border-none resize-none focus-visible:ring-0 text-zinc-200"
                    placeholder={
                      editMode.weekly
                        ? t('kakaoReport.placeholders.editTemplate')
                        : ''
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      handleCopyReport('weekly', getReportContent('weekly'))
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    {copiedStates.weekly ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {t('kakaoReport.notifications.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        {t('buttons.copy')}
                      </>
                    )}
                  </Button>

                  {!editMode.weekly ? (
                    <Button
                      onClick={() => {
                        setEditMode(prev => ({ ...prev, weekly: true }));
                        if (!hasCustomTemplate.weekly) {
                          setCustomTemplates(prev => ({
                            ...prev,
                            weekly: generateWeeklyReport(),
                          }));
                        }
                      }}
                      variant="outline"
                      size="default"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 px-4"
                    >
                      {t('buttons.edit')}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSaveTemplate('weekly')}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {copiedStates.saved_weekly ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {t('kakaoReport.notifications.templateSaved')}
                          </>
                        ) : (
                          t('buttons.saveTemplate')
                        )}
                      </Button>
                      <Button
                        onClick={() =>
                          setEditMode(prev => ({ ...prev, weekly: false }))
                        }
                        variant="outline"
                        size="sm"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      >
                        {t('buttons.cancel')}
                      </Button>
                      {hasCustomTemplate.weekly && (
                        <Button
                          onClick={() => handleResetTemplate('weekly')}
                          variant="destructive"
                          size="sm"
                        >
                          {t('buttons.resetTemplate')}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-3 mt-4">
                <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <Textarea
                    value={
                      editMode.monthly
                        ? customTemplates.monthly
                        : getReportContent('monthly')
                    }
                    onChange={e =>
                      editMode.monthly
                        ? handleTemplateEdit('monthly', e.target.value)
                        : undefined
                    }
                    readOnly={!editMode.monthly}
                    className="min-h-[320px] text-sm font-mono bg-transparent border-none resize-none focus-visible:ring-0 text-zinc-200"
                    placeholder={
                      editMode.monthly
                        ? t('kakaoReport.placeholders.editTemplate')
                        : ''
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      handleCopyReport('monthly', getReportContent('monthly'))
                    }
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    {copiedStates.monthly ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {t('kakaoReport.notifications.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        {t('buttons.copy')}
                      </>
                    )}
                  </Button>

                  {!editMode.monthly ? (
                    <Button
                      onClick={() => {
                        setEditMode(prev => ({ ...prev, monthly: true }));
                        if (!hasCustomTemplate.monthly) {
                          setCustomTemplates(prev => ({
                            ...prev,
                            monthly: generateMonthlyReport(),
                          }));
                        }
                      }}
                      variant="outline"
                      size="default"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 px-4"
                    >
                      {t('buttons.edit')}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSaveTemplate('monthly')}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {copiedStates.saved_monthly ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {t('kakaoReport.notifications.templateSaved')}
                          </>
                        ) : (
                          t('buttons.saveTemplate')
                        )}
                      </Button>
                      <Button
                        onClick={() =>
                          setEditMode(prev => ({ ...prev, monthly: false }))
                        }
                        variant="outline"
                        size="sm"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      >
                        {t('buttons.cancel')}
                      </Button>
                      {hasCustomTemplate.monthly && (
                        <Button
                          onClick={() => handleResetTemplate('monthly')}
                          variant="destructive"
                          size="sm"
                        >
                          {t('buttons.resetTemplate')}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
