import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  BellIcon,
  CheckIcon,
  HeartIcon,
  ArchiveIcon,
  EnvelopeClosedIcon,
} from '@radix-ui/react-icons';
import type { Influencer, GratitudeHistoryItem } from './types';

interface GratitudeManagementProps {
  influencers: Influencer[];
  gratitudeHistory: GratitudeHistoryItem[];
  onGratitudeClick: (influencer: Influencer) => void;
}

export function GratitudeManagement({
  influencers,
  gratitudeHistory,
  onGratitudeClick,
}: GratitudeManagementProps) {
  // 감사 표현이 필요한 소개자들 필터링
  const needsGratitude = influencers.filter((i) => {
    const lastDate = new Date(i.lastGratitude);
    const now = new Date();
    const diffDays =
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 30;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 감사 표현 필요 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            감사 표현 필요
          </CardTitle>
          <CardDescription>
            마지막 감사 표현 후 30일이 지난 소개자들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {needsGratitude.map((influencer) => (
              <div
                key={influencer.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{influencer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      마지막 감사: {influencer.lastGratitude}
                    </div>
                  </div>
                </div>
                <Button size="sm" onClick={() => onGratitudeClick(influencer)}>
                  <HeartIcon className="h-4 w-4 mr-2" />
                  감사 표현
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 감사 히스토리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckIcon className="h-5 w-5" />
            최근 감사 활동
          </CardTitle>
          <CardDescription>감사 메시지와 선물 발송 기록</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gratitudeHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  {item.type === 'gift' ? (
                    <ArchiveIcon className="h-4 w-4" />
                  ) : (
                    <EnvelopeClosedIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.influencerName}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.sentDate || item.scheduledDate}
                    </Badge>
                    {item.giftType && (
                      <Badge variant="outline" className="text-xs">
                        {item.giftType}
                      </Badge>
                    )}
                    <Badge
                      variant={item.status === 'sent' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status === 'sent' ? '발송완료' : '예약됨'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
