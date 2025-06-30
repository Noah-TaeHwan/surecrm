import { useMemo } from 'react';
import {
  X,
  Users,
  TrendingUp,
  Phone,
  Mail,
  UserRound,
  ArrowUpRight,
  MapPin,
  Briefcase,
  Car,
  Ruler,
  Weight,
  Calendar,
  User,
} from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Separator } from '~/common/components/ui/separator';
import { Link } from 'react-router';
import { cn } from '~/lib/utils';
import type { NetworkNode, NetworkLink, NetworkData } from '../types';

interface NetworkDetailPanelProps {
  nodeId: string;
  data: NetworkData;
  onClose: () => void;
  onNodeSelect?: (nodeId: string) => void;
  clientsData?: any[];
  stages?: any[];
  referralData?: any;
  agentInfo?: any;
}

export default function NetworkDetailPanel({
  nodeId,
  data,
  onClose,
  onNodeSelect,
  clientsData = [],
  stages = [],
  referralData = {},
  agentInfo = null,
}: NetworkDetailPanelProps) {
  // 🌍 다국어 번역 훅
  const { t } = useHydrationSafeTranslation('network');

  // 선택된 노드 정보
  const selectedNode = useMemo(() => {
    return data.nodes.find(node => node.id === nodeId);
  }, [data.nodes, nodeId]);

  // 실제 클라이언트 데이터 조회
  const clientData = useMemo(() => {
    return clientsData.find(client => client.id === nodeId);
  }, [clientsData, nodeId]);

  // 소개 관계 데이터
  const referralInfo = useMemo(() => {
    return referralData[nodeId] || { referredBy: null, referredClients: [] };
  }, [referralData, nodeId]);

  // 소개한 사람들 (이 노드가 소스인 링크들의 타겟)
  const referredNodes = useMemo(() => {
    if (!selectedNode) return [];

    const referredLinks = data.links.filter(link => {
      const sourceId =
        typeof link.source === 'string'
          ? link.source
          : (link.source as NetworkNode).id;
      return sourceId === nodeId;
    });

    return referredLinks
      .map(link => {
        const targetId =
          typeof link.target === 'string'
            ? link.target
            : (link.target as NetworkNode).id;
        const node = data.nodes.find(node => node.id === targetId);
        const clientInfo = clientsData.find(client => client.id === targetId);
        return node && clientInfo ? { ...node, clientInfo } : null;
      })
      .filter(Boolean) as (NetworkNode & { clientInfo: any })[];
  }, [data, nodeId, selectedNode, clientsData]);

  // 소개받은 사람 (이 노드가 타겟인 링크들의 소스)
  const referredByNode = useMemo(() => {
    if (!selectedNode) return null;

    const referredByLink = data.links.find(link => {
      const targetId =
        typeof link.target === 'string'
          ? link.target
          : (link.target as NetworkNode).id;
      return targetId === nodeId;
    });

    if (!referredByLink) return null;

    const sourceId =
      typeof referredByLink.source === 'string'
        ? referredByLink.source
        : (referredByLink.source as NetworkNode).id;

    const node = data.nodes.find(node => node.id === sourceId);
    const clientInfo = clientsData.find(client => client.id === sourceId);
    return node && clientInfo ? { ...node, clientInfo } : null;
  }, [data, nodeId, selectedNode, clientsData]);

  if (!selectedNode) {
    return null;
  }

  // 노드 타입 확인 (에이전트 vs 클라이언트)
  const isAgentNode = selectedNode?.type === 'agent';

  // 연결된 노드들을 통한 통계 계산
  const connections = referredNodes.length;

  const handleReferralAction = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };

  // 🎨 중요도 배지 색상 (서비스 전체 통일 색상 시스템 사용)
  const getImportanceBadgeColor = (importance: string | undefined) => {
    switch (importance) {
      case 'high':
        return 'border bg-[var(--importance-high-badge-bg)] text-[var(--importance-high-badge-text)] border-[var(--importance-high-border)]';
      case 'medium':
        return 'border bg-[var(--importance-medium-badge-bg)] text-[var(--importance-medium-badge-text)] border-[var(--importance-medium-border)]';
      case 'low':
        return 'border bg-[var(--importance-low-badge-bg)] text-[var(--importance-low-badge-text)] border-[var(--importance-low-border)]';
      default:
        return 'border bg-[var(--importance-low-badge-bg)] text-[var(--importance-low-badge-text)] border-[var(--importance-low-border)]';
    }
  };

  const getImportanceText = (importance: string | undefined) => {
    switch (importance) {
      case 'high':
        return t('detailPanel.importance.high', '키맨');
      case 'medium':
        return t('detailPanel.importance.medium', '일반');
      case 'low':
        return t('detailPanel.importance.low', '관심');
      default:
        return t('detailPanel.importance.unset', '미설정');
    }
  };

  // 영업 단계별 배지 색상
  const getStageBadgeColor = (stageName: string | undefined) => {
    if (!stageName) return 'default';

    const stageColorMap: Record<string, string> = {
      '첫 상담': 'secondary',
      '니즈 분석': 'default',
      '상품 설명': 'outline',
      '계약 검토': 'destructive',
      '계약 완료': 'default',
    };

    return stageColorMap[stageName] || 'default';
  };

  // 나이 계산 함수
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // 통신사별 이모지
  const getTelecomEmoji = (provider: string) => {
    const telecomMap: Record<string, string> = {
      SKT: '📱',
      KT: '📞',
      'LG U+': '📲',
      LG유플러스: '📲',
      '알뜰폰 SKT': '🔹',
      '알뜰폰 KT': '🔸',
      '알뜰폰 LG U+': '🔺',
    };
    return telecomMap[provider] || '📱';
  };

  // 다른 고객 노드를 선택하는 함수
  const handleNodeSelect = (id: string) => {
    // 현재 선택된 노드와 동일하면 무시
    if (id === nodeId) return;

    // 클릭 효과를 위한 시각적 피드백
    const btn = document.activeElement as HTMLElement;
    if (btn) btn.blur();

    // 노드 선택 및 이동
    if (onNodeSelect) {
      onNodeSelect(id);
    }
  };

  return (
    <div
      className={cn(
        'w-full',
        'h-full bg-background flex flex-col',
        'lg:border-l'
      )}
      style={{ maxHeight: '100%' }}
    >
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isAgentNode
              ? t('detailPanel.agentTitle', '내 정보')
              : t('detailPanel.title', '고객 정보')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            <X className="h-4 w-4 transition-transform duration-200" />
          </Button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 pt-0"
        style={{
          maxHeight: 'calc(100% - 80px)',
        }}
      >
        <div className="space-y-4">
          {/* 기본 정보 */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{selectedNode.name}</h3>
            <div className="flex items-center flex-wrap gap-2">
              {isAgentNode ? (
                /* 에이전트 정보 */
                <>
                  <Badge
                    variant="default"
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    {t('relationships.agent', '에이전트')}
                  </Badge>
                  <Badge variant="outline">
                    {t(
                      'detailPanel.network.totalClients',
                      '총 {{count}}명 고객',
                      { count: referredNodes.length }
                    )}
                  </Badge>
                </>
              ) : (
                /* 클라이언트 정보 */
                <>
                  {/* 영업 단계 배지 */}
                  <Badge
                    variant={getStageBadgeColor(clientData?.stageName) as any}
                  >
                    {clientData?.stageName || t('stages.unset', '단계 미설정')}
                  </Badge>
                  {/* 중요도 배지 */}
                  <Badge
                    className={`${getImportanceBadgeColor(
                      clientData?.importance
                    )} text-xs font-medium`}
                  >
                    {getImportanceText(clientData?.importance)}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* 연락처 정보 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t('detailPanel.contact.title', '연락처 정보')}
            </h4>

            <div className="flex items-center text-sm">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {isAgentNode
                  ? agentInfo?.phone ||
                    t('detailPanel.contact.notProvided', '미입력')
                  : clientData?.phone ||
                    t('detailPanel.contact.notProvided', '미입력')}
              </span>
              {(isAgentNode
                ? agentInfo?.telecomProvider
                : clientData?.telecomProvider) && (
                <span className="ml-2 text-muted-foreground">
                  {getTelecomEmoji(
                    isAgentNode
                      ? agentInfo.telecomProvider
                      : clientData.telecomProvider
                  )}{' '}
                  {isAgentNode
                    ? agentInfo.telecomProvider
                    : clientData.telecomProvider}
                </span>
              )}
            </div>

            <div className="flex items-center text-sm">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <span
                className={
                  (isAgentNode ? agentInfo?.email : clientData?.email)
                    ? ''
                    : 'text-muted-foreground'
                }
              >
                {isAgentNode
                  ? agentInfo?.email ||
                    t('detailPanel.contact.notProvided', '미입력')
                  : clientData?.email ||
                    t('detailPanel.contact.notProvided', '미입력')}
              </span>
            </div>

            {!isAgentNode && (
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span
                  className={clientData?.address ? '' : 'text-muted-foreground'}
                >
                  {clientData?.address ||
                    t('detailPanel.contact.notProvided', '미입력')}
                </span>
              </div>
            )}

            {!isAgentNode && (
              <div className="flex items-center text-sm">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <span
                  className={
                    clientData?.occupation ? '' : 'text-muted-foreground'
                  }
                >
                  {clientData?.occupation ||
                    t('detailPanel.contact.notProvided', '미입력')}
                </span>
              </div>
            )}

            {isAgentNode && (
              <div className="flex items-center text-sm">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <span
                  className={agentInfo?.company ? '' : 'text-muted-foreground'}
                >
                  {agentInfo?.company ||
                    t('detailPanel.contact.notProvided', '미입력')}
                </span>
              </div>
            )}
          </div>

          {isAgentNode ? (
            /* 에이전트 통계 정보 */
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('detailPanel.network.title', '네트워크 통계')}
              </h4>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {t('detailPanel.referred.count', '{{count}}명', {
                        count: referredNodes.length,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('detailPanel.network.totalClients', '총 고객')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {t('detailPanel.referred.count', '{{count}}건', {
                        count: connections,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t(
                        'detailPanel.network.referralConnections',
                        '소개 관계'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    {agentInfo?.createdAt ? (
                      <>
                        <div>
                          {new Date(agentInfo.createdAt).toLocaleDateString(
                            'ko-KR'
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('detailPanel.network.joinDate', '가입일')}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {t('detailPanel.contact.notProvided', '미입력')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-blue-600">
                      {t('detailPanel.network.active', '활성')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('detailPanel.network.status', '상태')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 클라이언트 개인 정보 */
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('detailPanel.personal.title', '개인 정보')}
              </h4>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    {clientData?.birthDate ? (
                      <>
                        <div>
                          {new Date(clientData.birthDate).toLocaleDateString(
                            'ko-KR'
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('detailPanel.personal.age', '{{age}}세', {
                            age: calculateAge(clientData.birthDate),
                          })}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {t('detailPanel.contact.notProvided', '미입력')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span
                    className={
                      clientData?.gender ? '' : 'text-muted-foreground'
                    }
                  >
                    {clientData?.gender === 'male'
                      ? t('detailPanel.personal.male', '남성')
                      : clientData?.gender === 'female'
                        ? t('detailPanel.personal.female', '여성')
                        : t('detailPanel.contact.notProvided', '미입력')}
                  </span>
                </div>

                <div className="flex items-center">
                  <Ruler className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span
                    className={
                      clientData?.height ? '' : 'text-muted-foreground'
                    }
                  >
                    {clientData?.height
                      ? t('detailPanel.personal.height', '{{height}}cm', {
                          height: clientData.height,
                        })
                      : t('detailPanel.contact.notProvided', '미입력')}
                  </span>
                </div>

                <div className="flex items-center">
                  <Weight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span
                    className={
                      clientData?.weight ? '' : 'text-muted-foreground'
                    }
                  >
                    {clientData?.weight
                      ? t('detailPanel.personal.weight', '{{weight}}kg', {
                          weight: clientData.weight,
                        })
                      : t('detailPanel.contact.notProvided', '미입력')}
                  </span>
                </div>

                <div className="flex items-center">
                  <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span
                    className={
                      clientData && clientData.hasDrivingLicense !== null
                        ? ''
                        : 'text-muted-foreground'
                    }
                  >
                    {clientData && clientData.hasDrivingLicense !== null
                      ? clientData.hasDrivingLicense
                        ? t('detailPanel.personal.canDrive', '운전가능')
                        : t('detailPanel.personal.cannotDrive', '운전불가')
                      : t('detailPanel.contact.notProvided', '미입력')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* 빠른 액션 버튼 */}
          <div className="space-y-2">
            {isAgentNode ? (
              /* 에이전트 버튼들 */
              <>
                <Link to="/pipeline">
                  <Button variant="outline" className="w-full mb-4">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {t(
                      'detailPanel.actions.viewPipeline',
                      '영업 파이프라인 보기'
                    )}
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="outline" className="w-full">
                    <UserRound className="mr-2 h-4 w-4" />
                    {t('detailPanel.actions.mySettings', '내 설정')}
                  </Button>
                </Link>
              </>
            ) : (
              /* 클라이언트 버튼들 */
              <>
                <Link to="/pipeline">
                  <Button variant="outline" className="w-full mb-4">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {t(
                      'detailPanel.actions.viewPipeline',
                      '영업 파이프라인 보기'
                    )}
                  </Button>
                </Link>
                <Link to={`/clients/${selectedNode.id}`}>
                  <Button variant="outline" className="w-full">
                    <UserRound className="mr-2 h-4 w-4" />
                    {t(
                      'detailPanel.actions.viewDetails',
                      '{{name}} 상세 정보',
                      { name: selectedNode.name }
                    )}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Separator />

          {/* 소개자 정보 - 에이전트 노드는 소개자가 없음 */}
          {!isAgentNode && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserRound className="h-4 w-4 text-blue-500" />
                {t('detailPanel.referrer.title', '소개자')}
              </h4>

              {referredByNode ? (
                <Card
                  className="group cursor-pointer hover:bg-accent/30 transition-all duration-200 border border-border/50 hover:border-blue-200/50 gap-0 py-0"
                  onClick={e => handleReferralAction(referredByNode.id, e)}
                >
                  <CardContent className="p-3 min-h-[56px] flex items-center">
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-blue-400/60 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {referredByNode.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {referredByNode.clientInfo?.stageName ||
                                t('stages.unset', '미설정')}
                            </span>
                            <Badge
                              className={`text-xs px-2 py-0.5 h-auto font-medium ${getImportanceBadgeColor(
                                referredByNode.clientInfo?.importance
                              )}`}
                            >
                              {getImportanceText(
                                referredByNode.clientInfo?.importance
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-border/30 gap-0 py-0">
                  <CardContent className="p-3 min-h-[56px] flex items-center">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
                      <span className="text-sm text-muted-foreground">
                        {t(
                          'detailPanel.referrer.directClient',
                          '직접 개발 고객'
                        )}
                      </span>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {t('detailPanel.referrer.newDevelopment', '신규 개발')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* 소개한 사람들 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                {isAgentNode
                  ? t('detailPanel.referred.clientsTitle', '직접 개발한 고객')
                  : t('detailPanel.referred.title', '소개한 고객')}
              </h4>
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 h-5 font-normal"
              >
                {t('detailPanel.referred.count', '{{count}}명', {
                  count: referredNodes.length,
                })}
              </Badge>
            </div>

            {referredNodes.length > 0 ? (
              <div className="space-y-2">
                {referredNodes.map(node => (
                  <Card
                    key={node.id}
                    className="group cursor-pointer hover:bg-accent/30 transition-all duration-200 border border-border/50 hover:border-orange-200/50 gap-0 py-0"
                    onClick={e => handleReferralAction(node.id, e)}
                  >
                    <CardContent className="p-3 min-h-[56px] flex items-center">
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-orange-400/60 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {node.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {node.clientInfo?.stageName ||
                                  t('stages.unset', '미설정')}
                              </span>
                              <Badge
                                className={`text-xs px-2 py-0.5 h-auto font-medium ${getImportanceBadgeColor(
                                  node.clientInfo?.importance
                                )}`}
                              >
                                {getImportanceText(node.clientInfo?.importance)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-border/30 gap-0 py-0">
                <CardContent className="p-3 min-h-[56px] flex items-center">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
                    <span className="text-sm text-muted-foreground">
                      {isAgentNode
                        ? t(
                            'detailPanel.referred.noClients',
                            '관리 중인 고객이 없습니다'
                          )
                        : t(
                            'detailPanel.referred.noReferrals',
                            '소개한 고객이 없습니다'
                          )}
                    </span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {isAgentNode
                        ? t(
                            'detailPanel.referred.newDevelopmentPossible',
                            '신규 개발'
                          )
                        : t(
                            'detailPanel.referred.developmentPossible',
                            '개발 가능'
                          )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
