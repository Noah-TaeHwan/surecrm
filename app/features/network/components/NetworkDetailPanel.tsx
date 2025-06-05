import { useMemo } from 'react';
import {
  X,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  UserRound,
  ArrowUpRight,
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
}

export default function NetworkDetailPanel({
  nodeId,
  data,
  onClose,
  onNodeSelect,
}: NetworkDetailPanelProps) {
  // 선택된 노드 정보
  const selectedNode = useMemo(() => {
    return data.nodes.find((node) => node.id === nodeId);
  }, [data.nodes, nodeId]);

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
        return data.nodes.find((node) => node.id === targetId);
      })
      .filter(Boolean) as NetworkNode[];
  }, [data, nodeId, selectedNode]);

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

    return data.nodes.find((node) => node.id === sourceId);
  }, [data, nodeId, selectedNode]);

  if (!selectedNode) return null;

  // 연결된 노드들을 통한 통계 계산
  const connections = referredNodes.length;
  const totalImportance = referredNodes.reduce(
    (sum, node) => sum + (node.importance || 0),
    0
  );

  const handleContactAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`${action} 액션 실행:`, selectedNode.name);
    // 실제 연락 액션 로직 구현
  };

  const handleReferralAction = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };

  // 영업 단계별 배지 색상
  const getStageBadgeColor = (stage: string | undefined) => {
    if (!stage) return 'default';

    const stageColorMap: Record<string, string> = {
      '첫 상담': 'secondary',
      '니즈 분석': 'default',
      '상품 설명': 'outline',
      '계약 검토': 'destructive',
      '계약 완료': 'default',
    };

    return stageColorMap[stage] || 'default';
  };

  // 중요도 별 표시
  const renderImportance = (importance: number | undefined) => {
    if (!importance) return null;

    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`text-lg ${
              index < importance ? 'text-primary' : 'text-muted-foreground/50'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // 다른 고객 노드를 선택하는 함수
  const handleNodeSelect = (id: string) => {
    // 현재 선택된 노드와 동일하면 무시
    if (id === nodeId) return;

    // 클릭 효과를 위한 시각적 피드백
    const btn = document.activeElement as HTMLElement;
    if (btn) btn.blur();

    // 사이드바가 바뀌는 것을 좀 더 명확히 보여주기 위한 시각적 표시
    // 예: 사이드바에 일시적인 로딩 효과나 전환 효과를 추가할 수도 있음

    // 노드 선택 및 이동
    if (onNodeSelect) {
      console.log(`고객 정보가 ${id}로 변경됩니다`);
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
          <h2 className="text-lg font-semibold">고객 정보</h2>
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
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{selectedNode.name}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={getStageBadgeColor(selectedNode.stage) as any}>
                {selectedNode.stage || '단계 미설정'}
              </Badge>
              {renderImportance(selectedNode.importance)}
            </div>
          </div>

          <Separator />

          {/* 연락처 정보 (더미 데이터) */}
          <div className="space-y-3">
            <div className="flex items-center text-muted-foreground">
              <Phone className="mr-2 h-4 w-4" />
              <span>010-1234-5678</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" />
              <span>{selectedNode.name.replace(/\s+/g, '')}@example.com</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>다음 미팅: 5월 25일 14:00</span>
            </div>
          </div>

          <Separator />
          <div className="space-y-6">
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
          </div>
          <Separator />

          {/* 소개자 정보 */}
          {referredByNode && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-blue-500" />
                <span>소개자</span>
              </h3>
              <div
                className="group p-2.5 border border-border bg-card hover:bg-accent/5 rounded-md transition-colors cursor-pointer flex items-center"
                onClick={(e) => handleReferralAction(referredByNode.id, e)}
              >
                <div className="w-1 self-stretch bg-primary/40 rounded-full mr-2.5"></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-card-foreground truncate">
                    {referredByNode.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{referredByNode.stage || '단계 미설정'}</span>
                    {referredByNode.importance && (
                      <span className="flex">
                        {Array.from({ length: referredByNode.importance }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-2.5 w-2.5 text-primary/60"
                            />
                          )
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full text-muted-foreground opacity-60 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReferralAction(referredByNode.id, e);
                  }}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span className="sr-only">보기</span>
                </Button>
              </div>
            </div>
          )}

          {/* 소개한 사람들 */}
          {referredNodes.length > 0 && (
            <div className="space-y-1.5 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-orange-500" />
                  <span>소개한 고객</span>
                </h3>
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0 h-4 font-normal"
                >
                  {referredNodes.length}명
                </Badge>
              </div>
              <div className="space-y-1.5">
                {referredNodes.map((node) => (
                  <div
                    key={node.id}
                    className="group p-2.5 border border-border bg-card hover:bg-accent/5 rounded-md transition-colors cursor-pointer flex items-center"
                    onClick={(e) => handleReferralAction(node.id, e)}
                  >
                    <div className="w-1 self-stretch bg-orange-500/40 rounded-full mr-2.5"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-card-foreground truncate">
                        {node.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{node.stage || '단계 미설정'}</span>
                        {node.importance && (
                          <span className="flex">
                            {Array.from({ length: node.importance }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="h-2.5 w-2.5 text-orange-500/60"
                                />
                              )
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full text-muted-foreground opacity-60 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReferralAction(node.id, e);
                      }}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span className="sr-only">보기</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 빠른 액션 버튼 */}
        </div>
      </div>
    </div>
  );
}
