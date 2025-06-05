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
  // 선택된 노드 정보
  const selectedNode = useMemo(() => {
    return data.nodes.find((node) => node.id === nodeId);
  }, [data.nodes, nodeId]);

  // 실제 클라이언트 데이터 조회
  const clientData = useMemo(() => {
    return clientsData.find((client) => client.id === nodeId);
  }, [clientsData, nodeId]);

  // 소개 관계 데이터
  const referralInfo = useMemo(() => {
    return referralData[nodeId] || { referredBy: null, referredClients: [] };
  }, [referralData, nodeId]);

  // 소개한 사람들 (이 노드가 소스인 링크들의 타겟)
  const referredNodes = useMemo(() => {
    if (!selectedNode) return [];

    const referredLinks = data.links.filter((link) => {
      const sourceId =
        typeof link.source === 'string'
          ? link.source
          : (link.source as NetworkNode).id;
      return sourceId === nodeId;
    });

    return referredLinks
      .map((link) => {
        const targetId =
          typeof link.target === 'string'
            ? link.target
            : (link.target as NetworkNode).id;
        const node = data.nodes.find((node) => node.id === targetId);
        const clientInfo = clientsData.find((client) => client.id === targetId);
        return node && clientInfo ? { ...node, clientInfo } : null;
      })
      .filter(Boolean) as (NetworkNode & { clientInfo: any })[];
  }, [data, nodeId, selectedNode, clientsData]);

  // 소개받은 사람 (이 노드가 타겟인 링크들의 소스)
  const referredByNode = useMemo(() => {
    if (!selectedNode) return null;

    const referredByLink = data.links.find((link) => {
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

    const node = data.nodes.find((node) => node.id === sourceId);
    const clientInfo = clientsData.find((client) => client.id === sourceId);
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

  // 중요도 배지 색상 (VIP, 일반, 관심)
  const getImportanceBadgeColor = (importance: string | undefined) => {
    switch (importance) {
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
      case 'low':
        return 'bg-muted text-muted-foreground border-muted-foreground/20';
      default:
        return 'bg-muted text-muted-foreground border-muted-foreground/20';
    }
  };

  const getImportanceText = (importance: string | undefined) => {
    switch (importance) {
      case 'high':
        return 'VIP';
      case 'medium':
        return '일반';
      case 'low':
        return '관심';
      default:
        return '미설정';
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
      className="w-full border-l h-full bg-background flex flex-col"
      style={{ maxHeight: '100%' }}
    >
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isAgentNode ? '내 정보' : '고객 정보'}
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
                    에이전트
                  </Badge>
                  <Badge variant="outline">
                    총 {referredNodes.length}명 고객
                  </Badge>
                </>
              ) : (
                /* 클라이언트 정보 */
                <>
                  {/* 영업 단계 배지 */}
                  <Badge
                    variant={getStageBadgeColor(clientData?.stageName) as any}
                  >
                    {clientData?.stageName || '단계 미설정'}
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
              연락처 정보
            </h4>

            <div className="flex items-center text-sm">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {isAgentNode
                  ? agentInfo?.phone || '미입력'
                  : clientData?.phone || '미입력'}
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
                  ? agentInfo?.email || '미입력'
                  : clientData?.email || '미입력'}
              </span>
            </div>

            {!isAgentNode && (
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span
                  className={clientData?.address ? '' : 'text-muted-foreground'}
                >
                  {clientData?.address || '미입력'}
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
                  {clientData?.occupation || '미입력'}
                </span>
              </div>
            )}

            {isAgentNode && (
              <div className="flex items-center text-sm">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <span
                  className={agentInfo?.company ? '' : 'text-muted-foreground'}
                >
                  {agentInfo?.company || '미입력'}
                </span>
              </div>
            )}
          </div>

          {isAgentNode ? (
            /* 에이전트 통계 정보 */
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                네트워크 통계
              </h4>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{referredNodes.length}명</div>
                    <div className="text-xs text-muted-foreground">총 고객</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{connections}건</div>
                    <div className="text-xs text-muted-foreground">
                      소개 관계
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
                          가입일
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">미입력</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-blue-600">활성</div>
                    <div className="text-xs text-muted-foreground">상태</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 클라이언트 개인 정보 */
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                개인 정보
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
                          {calculateAge(clientData.birthDate)}세
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">미입력</span>
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
                      ? '남성'
                      : clientData?.gender === 'female'
                      ? '여성'
                      : '미입력'}
                  </span>
                </div>

                <div className="flex items-center">
                  <Ruler className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span
                    className={
                      clientData?.height ? '' : 'text-muted-foreground'
                    }
                  >
                    {clientData?.height ? `${clientData.height}cm` : '미입력'}
                  </span>
                </div>

                <div className="flex items-center">
                  <Weight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span
                    className={
                      clientData?.weight ? '' : 'text-muted-foreground'
                    }
                  >
                    {clientData?.weight ? `${clientData.weight}kg` : '미입력'}
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
                        ? '운전가능'
                        : '운전불가'
                      : '미입력'}
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
                    영업 파이프라인 보기
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="outline" className="w-full">
                    <UserRound className="mr-2 h-4 w-4" />내 설정
                  </Button>
                </Link>
              </>
            ) : (
              /* 클라이언트 버튼들 */
              <>
                <Link to="/pipeline">
                  <Button variant="outline" className="w-full mb-4">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    영업 파이프라인 보기
                  </Button>
                </Link>
                <Link to={`/clients/${selectedNode.id}`}>
                  <Button variant="outline" className="w-full">
                    <UserRound className="mr-2 h-4 w-4" />
                    {selectedNode.name} 상세 정보
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
                소개자
              </h4>

              {referredByNode ? (
                <Card
                  className="group cursor-pointer hover:bg-accent/30 transition-all duration-200 border border-border/50 hover:border-blue-200/50 gap-0 py-0"
                  onClick={(e) => handleReferralAction(referredByNode.id, e)}
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
                              {referredByNode.clientInfo?.stageName || '미설정'}
                            </span>
                            <span className="text-xs text-blue-600 font-medium">
                              {getImportanceText(
                                referredByNode.clientInfo?.importance
                              )}
                            </span>
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
                        직접 개발 고객
                      </span>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        신규 개발
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
                {isAgentNode ? '관리 중인 고객' : '소개한 고객'}
              </h4>
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 h-5 font-normal"
              >
                {referredNodes.length}명
              </Badge>
            </div>

            {referredNodes.length > 0 ? (
              <div className="space-y-2">
                {referredNodes.map((node) => (
                  <Card
                    key={node.id}
                    className="group cursor-pointer hover:bg-accent/30 transition-all duration-200 border border-border/50 hover:border-orange-200/50 gap-0 py-0"
                    onClick={(e) => handleReferralAction(node.id, e)}
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
                                {node.clientInfo?.stageName || '미설정'}
                              </span>
                              <span className="text-xs text-orange-600 font-medium">
                                {getImportanceText(node.clientInfo?.importance)}
                              </span>
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
                        ? '관리 중인 고객이 없습니다'
                        : '소개한 고객이 없습니다'}
                    </span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {isAgentNode ? '신규 개발' : '개발 가능'}
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
