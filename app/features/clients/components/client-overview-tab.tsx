import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  ClockIcon,
  LayersIcon,
  CheckCircledIcon,
  UpdateIcon,
  LockClosedIcon,
  PersonIcon,
  CalendarIcon,
  FileTextIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  ActivityLogIcon,
} from '@radix-ui/react-icons';
import { useState } from 'react';
import { ReferralNetworkMini } from './referral-network-mini';
import { insuranceTypeConfig } from './insurance-config';
import type {
  ClientDisplay,
  ClientOverview,
  ClientPrivacyLevel,
} from '../types';
import { typeHelpers } from '../types';
import { logDataAccess } from '../lib/client-data';

// 🔧 미팅 타입 정의 (임시 - 실제로는 meetings schema에서 import)
interface Meeting {
  id: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledDate: string;
  location?: string;
  notes?: string;
}

// 🔧 단계 이력 타입 정의 (임시 - 실제로는 pipeline schema에서 import)
interface StageHistory {
  id: string;
  fromStage?: string;
  toStage: string;
  changedAt: string;
  changedBy: string;
  notes?: string;
}

// 🔧 보험 정보 타입 정의 (임시 - 실제로는 insurance schema에서 import)
interface InsuranceInfo {
  id: string;
  type: string;
  status: 'active' | 'pending' | 'cancelled';
  premium?: number;
  startDate?: string;
  endDate?: string;
  policyNumber?: string;
}

interface ClientOverviewTabProps {
  client: ClientDisplay;
  clientOverview: ClientOverview;
  meetings: Meeting[];
  stageHistory: StageHistory[];
  insuranceInfo: InsuranceInfo[];
  agentId: string; // 🔒 보안 로깅용
  onDataAccess?: (accessType: string, data: string[]) => void;
}

export function ClientOverviewTab({
  client,
  clientOverview,
  meetings,
  stageHistory,
  insuranceInfo,
  agentId,
  onDataAccess,
}: ClientOverviewTabProps) {
  // 🔒 개인정보 표시 제어
  const [showConfidentialData, setShowConfidentialData] = useState(false);

  const privacyLevel = (client.accessLevel ||
    client.privacyLevel ||
    'private') as ClientPrivacyLevel;

  // 🔒 데이터 접근 로깅
  const handleDataAccess = async (accessType: string, dataFields: string[]) => {
    try {
      await logDataAccess(
        client.id,
        agentId,
        'view',
        dataFields,
        undefined,
        navigator.userAgent,
        `고객 개요 ${accessType}`
      );
      onDataAccess?.(accessType, dataFields);
    } catch (error) {
      console.error('데이터 접근 로깅 실패:', error);
    }
  };

  // 🔒 데이터 마스킹 함수
  const maskData = (data: string, level: ClientPrivacyLevel = privacyLevel) => {
    return typeHelpers.maskData(data, level, showConfidentialData);
  };

  // 미팅 상태별 아이콘 및 설정
  const meetingStatusConfig: Record<
    string,
    {
      icon: React.ReactNode;
      color: string;
      text: string;
    }
  > = {
    scheduled: {
      icon: <ClockIcon className="h-4 w-4" />,
      color: 'text-blue-600',
      text: '예정',
    },
    completed: {
      icon: <CheckCircledIcon className="h-4 w-4" />,
      color: 'text-green-600',
      text: '완료',
    },
    cancelled: {
      icon: <CheckCircledIcon className="h-4 w-4" />,
      color: 'text-red-600',
      text: '취소',
    },
    rescheduled: {
      icon: <UpdateIcon className="h-4 w-4" />,
      color: 'text-yellow-600',
      text: '변경',
    },
  };

  // 🔒 보안 통계 계산
  const securityStats = {
    totalDataAccess: clientOverview.accessLevel,
    lastBackup: '2024-01-15', // 실제로는 DB에서 조회
    complianceStatus: clientOverview.dataConsents.dataProcessing
      ? 'compliant'
      : 'pending',
  };

  return (
    <div className="space-y-6">
      {/* 🔒 개인정보 보호 컨트롤 헤더 */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LockClosedIcon className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">
                개인정보 보호 레벨:{' '}
                <Badge variant="outline">{privacyLevel}</Badge>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-confidential-overview" className="text-xs">
                  기밀정보 표시
                </Label>
                <Switch
                  id="show-confidential-overview"
                  checked={showConfidentialData}
                  onCheckedChange={(checked) => {
                    setShowConfidentialData(checked);
                    handleDataAccess(
                      checked ? '기밀정보 표시' : '기밀정보 숨김',
                      ['privacy_settings']
                    );
                  }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleDataAccess('보안 설정 확인', ['security_settings'])
                }
              >
                <LockClosedIcon className="h-3 w-3 mr-1" />
                보안 설정
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 소개 네트워크 미니 그래프 - 업데이트된 컴포넌트 사용 */}
        <ReferralNetworkMini
          client={client}
          referrals={[]} // 실제로는 clientOverview에서 관련 고객 목록 전달
          onSeeMore={() =>
            handleDataAccess('소개 네트워크 확장', ['referral_network'])
          }
        />

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityLogIcon className="h-5 w-5" />
              최근 활동
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LockClosedIcon className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>접근 로그가 기록됩니다</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 최근 미팅 활동 */}
              {meetings.slice(0, 2).map((meeting) => {
                const config = meetingStatusConfig[meeting.status];
                return (
                  <div
                    key={meeting.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    onClick={() =>
                      handleDataAccess('미팅 상세 조회', [
                        'meetings',
                        meeting.id,
                      ])
                    }
                  >
                    <div className={config.color}>{config.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {maskData(meeting.type, privacyLevel)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {maskData(meeting.scheduledDate, privacyLevel)}
                        {meeting.location &&
                          ` • ${maskData(meeting.location, privacyLevel)}`}
                      </div>
                    </div>
                    <Badge
                      variant={
                        meeting.status === 'completed' ? 'default' : 'outline'
                      }
                    >
                      {config.text}
                    </Badge>
                  </div>
                );
              })}

              {/* 단계 변경 이력 */}
              {stageHistory.slice(0, 2).map((history, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    handleDataAccess('단계 이력 조회', [
                      'stage_history',
                      history.id,
                    ])
                  }
                >
                  <UpdateIcon className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {`${history.fromStage || '시작'} → ${history.toStage}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {maskData(history.changedAt, privacyLevel)} •{' '}
                      {maskData(history.changedBy, privacyLevel)}
                    </div>
                    {history.notes && (
                      <div className="text-xs">
                        {maskData(history.notes, privacyLevel)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* 빈 상태 처리 */}
              {meetings.length === 0 && stageHistory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ActivityLogIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>아직 활동 기록이 없습니다</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 보험 정보 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayersIcon className="h-5 w-5" />
            보험 정보 요약
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <LockClosedIcon className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>민감한 금융 정보가 포함되어 있습니다</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insuranceInfo.map((insurance) => {
              const config = insuranceTypeConfig[insurance.type] || {
                label: insurance.type,
                icon: <FileTextIcon className="h-4 w-4" />,
                color: 'bg-gray-100',
              };

              return (
                <Card
                  key={insurance.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    handleDataAccess('보험 상세 조회', [
                      'insurance',
                      insurance.id,
                    ])
                  }
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      {config.icon}
                    </div>
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <Badge
                        variant={
                          insurance.status === 'active' ? 'default' : 'outline'
                        }
                      >
                        {insurance.status === 'active' ? '활성' : '검토중'}
                      </Badge>
                    </div>
                  </div>

                  {insurance.premium && (
                    <div className="text-lg font-bold">
                      {showConfidentialData
                        ? `₩${insurance.premium.toLocaleString()}`
                        : '₩***,***'}
                    </div>
                  )}

                  {insurance.startDate && (
                    <div className="text-sm text-muted-foreground">
                      {maskData(insurance.startDate, 'private')} ~{' '}
                      {maskData(insurance.endDate || '', 'private')}
                    </div>
                  )}

                  {insurance.policyNumber && showConfidentialData && (
                    <div className="text-xs text-muted-foreground mt-2">
                      증권번호: {insurance.policyNumber}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* 빈 상태 처리 */}
          {insuranceInfo.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <LayersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>등록된 보험 정보가 없습니다</p>
              <Button variant="outline" className="mt-4">
                <LayersIcon className="h-4 w-4 mr-2" />
                보험 정보 추가
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔒 보안 및 컴플라이언스 상태 */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <LockClosedIcon className="h-5 w-5" />
            데이터 보안 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {clientOverview.dataConsents.dataProcessing ? '✓' : '⚠️'}
              </div>
              <div className="text-sm text-muted-foreground">
                GDPR 컴플라이언스
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {clientOverview.lastAccessLog ? '✓' : '-'}
              </div>
              <div className="text-sm text-muted-foreground">접근 로그</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {securityStats.lastBackup ? '✓' : '⚠️'}
              </div>
              <div className="text-sm text-muted-foreground">백업 상태</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
