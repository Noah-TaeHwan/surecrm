import { TabsContent } from '~/common/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
    <TabsContent value="companions" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-lg">👥</span>
            상담 같이 들어야하는 소중한 분
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            상담에 함께 참석할 동반자 정보를 관리합니다.
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* 동반자 추가 버튼 */}
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-foreground">등록된 동반자</h4>
            <Button variant="outline" size="sm" onClick={handleAddCompanion}>
              <Plus className="h-4 w-4 mr-2" />
              동반자 추가
            </Button>
          </div>

          {/* 동반자 목록 */}
          <div className="space-y-4">
            {consultationCompanions && consultationCompanions.length > 0 ? (
              consultationCompanions.map((companion) => (
                <div
                  key={companion.id}
                  className="p-4 bg-muted/20 rounded-lg border border-border/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">👤</span>
                        <div>
                          <h5 className="font-medium text-foreground">
                            {companion.name}
                          </h5>
                          <span className="text-sm text-muted-foreground">
                            {companion.relationship}
                          </span>
                        </div>
                      </div>
                      {companion.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{companion.phone}</span>
                        </div>
                      )}
                      {companion.isPrimary && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            주 동반자
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          companion.id && handleEditCompanion(companion)
                        }
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          companion.id && handleDeleteCompanion(companion.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* 빈 상태 */
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h4 className="font-medium text-foreground mb-2">
                  동반자가 없습니다
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  상담에 함께 참석할 동반자를 추가해보세요.
                </p>
                <Button variant="outline" onClick={handleAddCompanion}>
                  <Plus className="h-4 w-4 mr-2" />첫 동반자 추가
                </Button>
              </div>
            )}
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
