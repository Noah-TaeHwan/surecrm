import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import {
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  UpdateIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { AddMeetingModal } from './add-meeting-modal';
import type { Meeting } from './types';

interface ClientMeetingsTabProps {
  meetings: Meeting[];
  clientId: string;
  clientName: string;
}

export function ClientMeetingsTab({
  meetings,
  clientId,
  clientName,
}: ClientMeetingsTabProps) {
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);

  // 미팅 상태별 아이콘
  const meetingStatusIcon: Record<string, React.ReactNode> = {
    scheduled: <ClockIcon className="h-4 w-4 text-primary" />,
    completed: <CheckCircledIcon className="h-4 w-4 text-primary" />,
    cancelled: <CrossCircledIcon className="h-4 w-4 text-destructive" />,
    rescheduled: <UpdateIcon className="h-4 w-4 text-muted-foreground" />,
  };

  const handleMeetingAdded = (newMeeting: any) => {
    // TODO: 실제 API 호출로 미팅 추가
    console.log('새 미팅 추가됨:', newMeeting);
    // 상태 업데이트 또는 새로고침 로직
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            미팅 이력
            <Button size="sm" onClick={() => setIsAddMeetingOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              미팅 예약
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {meetingStatusIcon[meeting.status]}
                    <div>
                      <div className="font-medium">{meeting.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {meeting.date} {meeting.time} • {meeting.duration}분
                      </div>
                      <div className="text-sm text-muted-foreground">
                        📍 {meeting.location}
                      </div>
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

                {meeting.notes && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">메모</div>
                    <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                      {meeting.notes}
                    </div>
                  </div>
                )}

                {meeting.checklist && meeting.checklist.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">체크리스트</div>
                    <div className="space-y-1">
                      {meeting.checklist.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {item.completed ? (
                            <CheckCircledIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <CrossCircledIcon className="h-4 w-4 text-gray-400" />
                          )}
                          <span
                            className={`text-sm ${
                              item.completed ? '' : 'text-muted-foreground'
                            }`}
                          >
                            {item.item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 미팅 추가 모달 */}
      <AddMeetingModal
        open={isAddMeetingOpen}
        onOpenChange={setIsAddMeetingOpen}
        clientId={clientId}
        clientName={clientName}
        onMeetingAdded={handleMeetingAdded}
      />
    </div>
  );
}
