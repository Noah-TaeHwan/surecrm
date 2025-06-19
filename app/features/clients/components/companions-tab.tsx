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
    <TabsContent value="companions" className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground leading-tight">상담동반자</h3>
            <Button
              size="sm"
              className="flex-shrink-0"
              onClick={handleAddCompanion}
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">동반자 </span>추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-5 md:space-y-6">
          
          {/* 👥 등록된 동반자 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              👥 등록된 동반자
            </h4>
            
            {consultationCompanions && consultationCompanions.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {consultationCompanions.map(companion => (
                  <div
                    key={companion.id}
                    className="p-3 md:p-4 bg-muted/20 rounded-lg border border-border/40"
                  >
                    {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 space-y-2 md:space-y-3">
                        {/* 이름과 관계 */}
                        <div className="flex items-center gap-3">
                          <span className="text-lg md:text-xl flex-shrink-0">👤</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-medium text-foreground text-sm md:text-base">
                                {companion.name}
                              </h5>
                              <span className="text-xs md:text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                {companion.relationship}
                              </span>
                              {companion.isPrimary && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                                  주 동반자
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* 연락처 */}
                        {companion.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-8 md:ml-11">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="font-mono">{companion.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex gap-1 md:gap-2 self-end md:self-start flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            companion.id && handleEditCompanion(companion)
                          }
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            companion.id && handleDeleteCompanion(companion.id)
                          }
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 빈 상태 */
              <div className="text-center py-8 md:py-12 p-3 md:p-4 bg-muted/10 rounded-lg border border-border/30">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">👥</span>
                </div>
                <h4 className="font-medium text-foreground mb-2 text-sm md:text-base">
                  동반자가 없습니다
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                  상담에 함께 참석할 동반자를 추가해보세요.
                </p>
                <Button 
                  size="sm"
                  onClick={handleAddCompanion}
                  className="text-xs md:text-sm"
                >
                  <Plus className="h-4 w-4 mr-1 md:mr-2" />
                  첫 동반자 추가
                </Button>
              </div>
            )}
          </div>

          {/* 📝 동반자 안내 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              📝 동반자 안내
            </h4>
            <div className="p-3 md:p-4 bg-secondary/20 rounded-lg border border-border/40">
              <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
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
            <h5 className="font-medium text-foreground mb-4">새 동반자 추가</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  성함 *
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="동반자 성함"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  관계 *
                </label>
                <select
                  className="w-full p-2 border rounded-lg text-sm"
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  연락처 *
                </label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="010-0000-0000"
                  disabled
                />
              </div>
              <div className="md:col-span-2">
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
