import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { CalendarIcon, Link2Icon, Share1Icon } from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { ReferralDepthIndicator } from './referral-depth-indicator';
import { insuranceTypeIcons, insuranceTypeText } from './insurance-config';

interface Client {
  id: string;
  name: string;
  company?: string;
  importance: string;
  stage: string;
  referredBy?: {
    id: string;
    name: string;
  };
  referralDepth: number;
  referralCount: number;
  nextMeetingDate?: string;
  tags?: string[];
  insuranceTypes?: string[];
}

interface ClientCardProps {
  client: Client;
  importanceBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  >;
  importanceText: Record<string, string>;
  stageBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  >;
}

export function ClientCard({
  client,
  importanceBadgeVariant,
  importanceText,
  stageBadgeVariant,
}: ClientCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10">
                {client.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link to={`/clients/${client.id}`} className="hover:underline">
                <CardTitle className="text-lg">{client.name}</CardTitle>
              </Link>
              <CardDescription className="flex items-center gap-2">
                {client.company && <span>{client.company}</span>}
                <ReferralDepthIndicator depth={client.referralDepth} />
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={importanceBadgeVariant[client.importance]}>
              {importanceText[client.importance]}
            </Badge>
            {client.referralCount > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Share1Icon className="h-3 w-3" />
                {client.referralCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={stageBadgeVariant[client.stage] || 'outline'}>
              {client.stage}
            </Badge>
            <div className="flex items-center gap-1">
              {client.insuranceTypes?.map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-1 text-muted-foreground"
                >
                  {insuranceTypeIcons[type]}
                  <span className="text-xs">{insuranceTypeText[type]}</span>
                </div>
              ))}
            </div>
          </div>

          {client.referredBy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2Icon className="h-3 w-3" />
              <span>{client.referredBy.name}님 소개</span>
            </div>
          )}

          {client.nextMeetingDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>다음 미팅: {client.nextMeetingDate}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {client.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
