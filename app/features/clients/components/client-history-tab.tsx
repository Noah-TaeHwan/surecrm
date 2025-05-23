import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  CalendarIcon,
  UpdateIcon,
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons';
import type { Meeting, StageHistory } from './types';

interface ClientHistoryTabProps {
  meetings: Meeting[];
  stageHistory: StageHistory[];
}

type TimelineItem = (Meeting | StageHistory) & {
  itemType: 'meeting' | 'stage';
};

export function ClientHistoryTab({
  meetings,
  stageHistory,
}: ClientHistoryTabProps) {
  // 미팅 상태별 아이콘
  const meetingStatusIcon: Record<string, React.ReactNode> = {
    scheduled: <ClockIcon className="h-4 w-4 text-blue-500" />,
    completed: <CheckCircledIcon className="h-4 w-4 text-green-500" />,
    cancelled: <CrossCircledIcon className="h-4 w-4 text-red-500" />,
    rescheduled: <UpdateIcon className="h-4 w-4 text-yellow-500" />,
  };

  // 미팅과 진행 내역을 합쳐서 날짜순으로 정렬
  const timelineItems: TimelineItem[] = [
    ...meetings.map((item) => ({ ...item, itemType: 'meeting' as const })),
    ...stageHistory.map((item) => ({ ...item, itemType: 'stage' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isMeeting = (
    item: TimelineItem
  ): item is Meeting & { itemType: 'meeting' } => {
    return item.itemType === 'meeting';
  };

  const isStageHistory = (
    item: TimelineItem
  ): item is StageHistory & { itemType: 'stage' } => {
    return item.itemType === 'stage';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>진행 내역</CardTitle>
          <CardDescription>고객과의 모든 상호작용 기록</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div
                key={`${item.itemType}-${index}`}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {isMeeting(item) ? (
                    meetingStatusIcon[item.status] || (
                      <CalendarIcon className="h-4 w-4" />
                    )
                  ) : (
                    <UpdateIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {isMeeting(item)
                      ? item.type
                      : `단계 변경: ${isStageHistory(item) ? item.stage : ''}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.date}
                    {isMeeting(item) && ` • ${item.time}`}
                    {isMeeting(item) && ` • ${item.location}`}
                  </div>
                  {isMeeting(item) && item.notes && (
                    <div className="text-sm mt-2 p-2 bg-muted rounded">
                      {item.notes}
                    </div>
                  )}
                  {isStageHistory(item) && (
                    <div className="text-sm mt-1 text-muted-foreground">
                      {item.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
