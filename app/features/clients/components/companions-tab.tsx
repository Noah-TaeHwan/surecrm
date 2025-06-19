import { TabsContent } from '~/common/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Plus, Edit2, Trash2, Phone } from 'lucide-react';

interface Companion {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

interface CompanionsTabProps {
  consultationCompanions: Companion[];
  handleAddCompanion: () => void;
  handleEditCompanion: (companion: Companion) => void;
  handleDeleteCompanion: (companionId: string) => void;
}

export function CompanionsTab({
  consultationCompanions,
  handleAddCompanion,
  handleEditCompanion,
  handleDeleteCompanion,
}: CompanionsTabProps) {
  return (
    <TabsContent value="companions" className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground leading-tight">상담동반자</h3>
            <Button
              size="sm"
              className="flex-shrink-0"
              onClick={handleAddCompanion}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">동반자 </span>추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          
          {/* 👥 등록된 동반자 */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm">
              👥 등록된 동반자
            </h4>
            
            {consultationCompanions && consultationCompanions.length > 0 ? (
              <div className="space-y-3">
                {consultationCompanions.map(companion => (
                  <div
                    key={companion.id}
                    className="p-4 bg-muted/20 rounded-lg border border-border/40"
                  >
                    {/* 헤더: 이름과 액션 버튼 */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-lg flex-shrink-0">👤</span>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-medium text-foreground text-sm leading-tight">
                            {companion.name}
                          </h5>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            companion.id && handleEditCompanion(companion)
                          }
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            companion.id && handleDeleteCompanion(companion.id)
                          }
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* 정보 섹션 - 세로 배치 */}
                    <div className="space-y-2">
                      {/* 관계 */}
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                        <span className="text-xs text-muted-foreground">
                          관계
                        </span>
                        <span className="text-xs bg-muted/50 px-2 py-1 rounded font-medium">
                          {companion.relationship}
                        </span>
                      </div>
                      
                      {/* 연락처 */}
                      {companion.phone && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                          <span className="text-xs text-muted-foreground">
                            연락처
                          </span>
                          <span className="font-mono text-sm font-medium">
                            {companion.phone}
                          </span>
                        </div>
                      )}
                      
                      {/* 주 동반자 여부 */}
                      {companion.isPrimary && (
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-xs text-muted-foreground">
                            상태
                          </span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                            주 동반자
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 빈 상태 */
              <div className="text-center py-8 p-4 bg-muted/10 rounded-lg border border-border/30">
                <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">👥</span>
                </div>
                <h4 className="font-medium text-foreground mb-2 text-sm">
                  동반자가 없습니다
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  상담에 함께 참석할 동반자를 추가해보세요.
                </p>
                <Button 
                  size="sm"
                  onClick={handleAddCompanion}
                  className="text-xs"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  첫 동반자 추가
                </Button>
              </div>
            )}
          </div>

          {/* 📝 동반자 안내 */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm">
              📝 동반자 안내
            </h4>
            <div className="p-3 bg-secondary/20 rounded-lg border border-border/40">
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>상담에 함께 참석하실 분의 정보를 미리 등록해두세요.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>주 동반자로 설정하면 우선적으로 연락을 드립니다.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>배우자, 자녀, 부모님 등 관계를 명확히 기록해주세요.</span>
                </p>
              </div>
            </div>
          </div>

          {/* 동반자 추가 폼 (숨김 상태) */}
          <div className="hidden p-4 bg-muted/30 rounded-lg border border-border">
            <h5 className="font-medium text-foreground mb-4 text-sm">새 동반자 추가</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  성함 *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg text-sm"
                  placeholder="동반자 성함"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  관계 *
                </label>
                <select
                  className="w-full p-3 border rounded-lg text-sm"
                  disabled
                >
                  <option>관계 선택</option>
                  <option>배우자</option>
                  <option>자녀</option>
                  <option>부모</option>
                  <option>형제/자매</option>
                  <option>기타</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  연락처 *
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border rounded-lg text-sm"
                  placeholder="010-0000-0000"
                  disabled
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" disabled />
                  <span className="text-sm">주 동반자로 설정</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" disabled>
                저장
              </Button>
              <Button variant="outline" size="sm" disabled>
                취소
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
