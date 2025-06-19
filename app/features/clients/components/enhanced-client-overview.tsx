import { useState } from 'react';
import { Badge } from '~/common/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Separator } from '~/common/components/ui/separator';
import { Progress } from '~/common/components/ui/progress';
import { formatCurrencyTable } from '~/lib/utils/currency';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  Network,
  Star,
  Clock,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Activity,
} from 'lucide-react';

interface Client {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  importance: 'high' | 'medium' | 'low';
  currentStage: {
    id: string;
    name: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
  notes?: string;
  // 계산된 필드들 (실제 데이터에서 계산)
  referralCount?: number;
  insuranceTypes?: string[];
  totalPremium?: number;
  engagementScore?: number;
  conversionProbability?: number;
  lifetimeValue?: number;
  lastContactDate?: string;
  nextActionDate?: string;
}

interface EnhancedClientOverviewProps {
  client: Client;
  onEditClient?: () => void;
  onDeleteClient?: () => void;
  onScheduleMeeting?: () => void;
  onAddNote?: () => void;
}

export function EnhancedClientOverview({
  client,
  onEditClient,
  onDeleteClient,
  onScheduleMeeting,
  onAddNote,
}: EnhancedClientOverviewProps) {
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return (
          <Badge variant="destructive" className="gap-1">
            <Star className="h-3 w-3" />
            키맨 고객
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="default" className="gap-1">
            <User className="h-3 w-3" />
            일반 고객
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="h-3 w-3" />
            일반 고객
          </Badge>
        );
      default:
        return <Badge variant="outline">{importance}</Badge>;
    }
  };

  const getPriorityColor = (probability?: number) => {
    if (!probability) return 'text-gray-500';
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-blue-600';
    if (probability >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEngagementLevel = (score?: number) => {
    if (!score) return { label: '미측정', color: 'text-gray-500' };
    if (score >= 8) return { label: '매우 높음', color: 'text-green-600' };
    if (score >= 6) return { label: '높음', color: 'text-blue-600' };
    if (score >= 4) return { label: '보통', color: 'text-orange-600' };
    return { label: '낮음', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      {/* 🎯 메인 고객 카드 */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-background to-background">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {client.fullName}
                  </h1>
                  <p className="text-muted-foreground">
                    {client.occupation || '직업 미기재'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getImportanceBadge(client.importance)}
                <Badge
                  variant="outline"
                  style={{
                    color: client.currentStage.color,
                    borderColor: client.currentStage.color + '40',
                    backgroundColor: client.currentStage.color + '10',
                  }}
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {client.currentStage.name}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onScheduleMeeting}>
                <Calendar className="h-4 w-4 mr-2" />
                일정 등록
              </Button>
              <Button variant="outline" size="sm" onClick={onEditClient}>
                수정
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 🔗 기본 연락처 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">전화번호</p>
                <a
                  href={`tel:${client.phone}`}
                  className="font-medium text-primary hover:underline"
                >
                  {client.phone}
                </a>
              </div>
            </div>

            {client.email && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">이메일</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="font-medium text-sm text-primary hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              </div>
            )}

            {client.address && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">주소</p>
                  <p className="font-medium text-sm">{client.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* 📊 핵심 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">예상 LTV</p>
              <p className="text-lg font-bold text-blue-600">
                {client.lifetimeValue
                  ? formatCurrencyTable(client.lifetimeValue)
                  : '미산출'}
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">전환 확률</p>
              <p
                className={`text-lg font-bold ${getPriorityColor(
                  client.conversionProbability
                )}`}
              >
                {client.conversionProbability
                  ? `${client.conversionProbability}%`
                  : '미산출'}
              </p>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <Network className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">소개 건수</p>
              <p className="text-lg font-bold text-orange-600">
                {client.referralCount || 0}건
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">참여도</p>
              <p
                className={`text-lg font-bold ${
                  getEngagementLevel(client.engagementScore).color
                }`}
              >
                {getEngagementLevel(client.engagementScore).label}
              </p>
            </div>
          </div>

          {/* 📋 추가 상세 정보 (토글 가능) */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="w-full"
            >
              {showMoreDetails ? '간단히 보기' : '상세 정보 보기'}
            </Button>

            {showMoreDetails && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 타임라인 정보 */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      타임라인
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">등록일</span>
                        <span>
                          {new Date(client.createdAt).toLocaleDateString(
                            'ko-KR'
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          최근 업데이트
                        </span>
                        <span>
                          {new Date(client.updatedAt).toLocaleDateString(
                            'ko-KR'
                          )}
                        </span>
                      </div>
                      {client.lastContactDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            마지막 상담
                          </span>
                          <span>
                            {new Date(
                              client.lastContactDate
                            ).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 보험 정보 */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      보험 현황
                    </h4>
                    <div className="space-y-2">
                      {client.insuranceTypes &&
                      client.insuranceTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {client.insuranceTypes.map((type, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          가입된 보험이 없습니다
                        </p>
                      )}

                      {client.totalPremium && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            월 보험료
                          </span>
                          <span className="font-medium">
                            {formatCurrencyTable(client.totalPremium)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 메모 */}
                {client.notes && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        메모
                      </h4>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {client.notes}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🚨 액션 필요 섹션 */}
      {client.nextActionDate && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              액션 필요
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  다음 액션 예정일:{' '}
                  {new Date(client.nextActionDate).toLocaleDateString('ko-KR')}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  고객 상담 및 팔로업이 필요합니다.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-orange-300"
                onClick={onAddNote}
              >
                노트 추가
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
