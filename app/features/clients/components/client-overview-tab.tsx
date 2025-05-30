import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import {
  ClockIcon,
  LayersIcon,
  CheckCircledIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { ReferralNetworkMini } from './referral-network-mini';
import { insuranceTypeConfig } from './insurance-config';
import type {
  Client,
  Meeting,
  InsuranceInfo,
  StageHistory,
  ReferralNetwork,
} from '../types';

interface ClientOverviewTabProps {
  client: Client;
  referralNetwork: ReferralNetwork;
  meetings: Meeting[];
  stageHistory: StageHistory[];
  insuranceInfo: InsuranceInfo[];
}

export function ClientOverviewTab({
  client,
  referralNetwork,
  meetings,
  stageHistory,
  insuranceInfo,
}: ClientOverviewTabProps) {
  // 미팅 상태별 아이콘
  const meetingStatusIcon: Record<string, React.ReactNode> = {
    scheduled: <ClockIcon className="h-4 w-4 text-primary" />,
    completed: <CheckCircledIcon className="h-4 w-4 text-primary" />,
    cancelled: <CheckCircledIcon className="h-4 w-4 text-destructive" />,
    rescheduled: <UpdateIcon className="h-4 w-4 text-muted-foreground" />,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 소개 네트워크 미니 그래프 - 분리된 컴포넌트 사용 */}
        <ReferralNetworkMini
          client={client as any}
          referrals={referralNetwork.referrals as any}
          stats={{
            totalReferred: referralNetwork.stats.totalReferred,
            conversionRate: referralNetwork.stats.conversionRate,
          }}
        />

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meetings.slice(0, 2).map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {meetingStatusIcon[meeting.status]}
                  <div className="flex-1">
                    <div className="font-medium">{meeting.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {meeting.scheduledDate} • {meeting.location}
                    </div>
                  </div>
                  <Badge
                    variant={
                      meeting.status === 'completed' ? 'default' : 'outline'
                    }
                  >
                    {meeting.status === 'completed' ? '완료' : '예정'}
                  </Badge>
                </div>
              ))}
              {stageHistory.slice(0, 2).map((history, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <UpdateIcon className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {`${history.fromStage || '시작'} → ${history.toStage}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {history.changedAt}
                    </div>
                    {history.notes && (
                      <div className="text-xs">{history.notes}</div>
                    )}
                  </div>
                </div>
              ))}
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insuranceInfo.map((insurance) => {
              const config = insuranceTypeConfig[insurance.type];
              return (
                <Card key={insurance.id} className="p-4">
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
                      ₩{insurance.premium.toLocaleString()}
                    </div>
                  )}
                  {insurance.startDate && (
                    <div className="text-sm text-muted-foreground">
                      {insurance.startDate} ~ {insurance.endDate}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
