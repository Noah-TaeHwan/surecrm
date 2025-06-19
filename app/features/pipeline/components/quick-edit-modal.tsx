import { useState, useEffect, useCallback } from 'react';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/common/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '~/common/components/ui/sheet';
import {
  Star,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  X,
  Save,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Tag,
  StickyNote,
} from 'lucide-react';
import { formatCurrencyTable } from '~/lib/utils/currency';
import type { Client } from '~/features/pipeline/types/types';

// 🎯 빠른 편집 모달 Props
interface QuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (clientId: string, updates: Partial<ExtendedClient>) => void;
  isMobile?: boolean;
}

// 🎯 편집 가능한 필드들
interface EditableFields {
  importance: 'high' | 'medium' | 'low';
  nextAction?: string;
  actionDueDate?: string;
  notes?: string;
  phone?: string;
  email?: string;
  probability?: number;
  dealValue?: number;
  tags?: string;
}

// 🎯 확장된 클라이언트 타입 (타입 안전성 확보)
interface ExtendedClient extends Client {
  nextAction?: string;
  actionDueDate?: string;
  probability?: number;
  dealValue?: number;
}

export function QuickEditModal({
  isOpen,
  onClose,
  client,
  onSave,
  isMobile = false,
}: QuickEditModalProps) {
  const [editFields, setEditFields] = useState<EditableFields>({
    importance: 'medium',
    nextAction: '',
    actionDueDate: '',
    notes: '',
    phone: '',
    email: '',
    probability: 0,
    dealValue: 0,
    tags: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 🎯 클라이언트 정보로 필드 초기화
  useEffect(() => {
    if (client) {
      setEditFields({
        importance: client.importance || 'medium',
        nextAction: (client as ExtendedClient).nextAction || '',
        actionDueDate: (client as ExtendedClient).actionDueDate || '',
        notes: client.note || '',
        phone: client.phone || '',
        email: client.email || '',
        probability: (client as ExtendedClient).probability || 0,
        dealValue:
          (client as ExtendedClient).dealValue ||
          (client.totalMonthlyPremium || 0) * 12,
        tags: Array.isArray(client.tags)
          ? client.tags.join(', ')
          : client.tags || '',
      });
      setHasChanges(false);
    }
  }, [client]);

  // 🎯 필드 변경 핸들러
  const handleFieldChange = useCallback(
    (field: keyof EditableFields, value: any) => {
      setEditFields(prev => ({
        ...prev,
        [field]: value,
      }));
      setHasChanges(true);

      // 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    },
    []
  );

  // 🎯 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!client || !hasChanges) return;

    setIsLoading(true);

    try {
      // 변경된 필드들만 추출 (타입 안전성 확보)
      const updates: Partial<ExtendedClient> = {};

      if (editFields.importance !== client.importance) {
        updates.importance = editFields.importance;
      }
      if (
        editFields.nextAction !== ((client as ExtendedClient).nextAction || '')
      ) {
        updates.nextAction = editFields.nextAction;
      }
      if (
        editFields.actionDueDate !==
        ((client as ExtendedClient).actionDueDate || '')
      ) {
        updates.actionDueDate = editFields.actionDueDate;
      }
      if (editFields.notes !== (client.note || '')) {
        updates.note = editFields.notes;
      }
      if (editFields.phone !== (client.phone || '')) {
        updates.phone = editFields.phone;
      }
      if (editFields.email !== (client.email || '')) {
        updates.email = editFields.email;
      }
      if (
        editFields.probability !== ((client as ExtendedClient).probability || 0)
      ) {
        updates.probability = editFields.probability;
      }
      if (
        editFields.dealValue !== ((client as ExtendedClient).dealValue || 0)
      ) {
        updates.dealValue = editFields.dealValue;
      }
      if (
        editFields.tags !==
        (Array.isArray(client.tags)
          ? client.tags.join(', ')
          : client.tags || '')
      ) {
        // 문자열을 배열로 변환해서 할당 (타입 안전성 확보)
        updates.tags = editFields.tags
          ? editFields.tags.split(',').map(tag => tag.trim())
          : [];
      }

      // 성공 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 100]);
      }

      await onSave(client.id, updates);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('빠른 편집 저장 실패:', error);

      // 오류 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate([100, 100, 100]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [client, editFields, hasChanges, onSave, onClose]);

  // 🎯 중요도별 스타일
  const importanceStyles = {
    high: {
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      label: '높음',
    },
    medium: {
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: '보통',
    },
    low: {
      color: 'text-muted-foreground',
      bg: 'bg-muted/30',
      border: 'border-muted',
      label: '낮음',
    },
  };

  // 🎯 모달 내용 렌더링
  const renderContent = () => (
    <div className="space-y-6">
      {/* 🎯 클라이언트 기본 정보 */}
      {client && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{client.name}</h3>
              <p className="text-sm text-muted-foreground">
                {client.occupation}
              </p>
            </div>
          </div>
          {(client.totalMonthlyPremium || client.totalExpectedCommission) && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="text-center p-2 bg-background rounded-md">
                <div className="text-xs text-muted-foreground">월 보험료</div>
                <div className="font-semibold text-green-600">
                  {formatCurrencyTable(client.totalMonthlyPremium || 0)}
                </div>
              </div>
              <div className="text-center p-2 bg-background rounded-md">
                <div className="text-xs text-muted-foreground">예상 수수료</div>
                <div className="font-semibold text-blue-600">
                  {formatCurrencyTable(client.totalExpectedCommission || 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🎯 중요도 설정 */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          중요도
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {(['high', 'medium', 'low'] as const).map(level => {
            const style = importanceStyles[level];
            const isSelected = editFields.importance === level;

            return (
              <Button
                key={level}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFieldChange('importance', level)}
                className={`${isSelected ? style.color + ' ' + style.bg + ' ' + style.border : ''}`}
              >
                {style.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 🎯 연락처 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            전화번호
          </Label>
          <Input
            type="tel"
            value={editFields.phone}
            onChange={e => handleFieldChange('phone', e.target.value)}
            placeholder="전화번호를 입력하세요"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            이메일
          </Label>
          <Input
            type="email"
            value={editFields.email}
            onChange={e => handleFieldChange('email', e.target.value)}
            placeholder="이메일을 입력하세요"
          />
        </div>
      </div>

      {/* 🎯 딜 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            성사 확률 (%)
          </Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={editFields.probability}
            onChange={e =>
              handleFieldChange('probability', parseInt(e.target.value) || 0)
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            거래 가치 (원)
          </Label>
          <Input
            type="number"
            min="0"
            value={editFields.dealValue}
            onChange={e =>
              handleFieldChange('dealValue', parseInt(e.target.value) || 0)
            }
            placeholder="거래 가치를 입력하세요"
          />
        </div>
      </div>

      {/* 🎯 다음 액션 */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          다음 액션
        </Label>
        <Input
          value={editFields.nextAction}
          onChange={e => handleFieldChange('nextAction', e.target.value)}
          placeholder="다음에 해야 할 일을 입력하세요"
        />
      </div>

      {/* 🎯 액션 마감일 */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          액션 마감일
        </Label>
        <Input
          type="date"
          value={editFields.actionDueDate}
          onChange={e => handleFieldChange('actionDueDate', e.target.value)}
        />
      </div>

      {/* 🎯 태그 */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          태그 (쉼표로 구분)
        </Label>
        <Input
          value={editFields.tags}
          onChange={e => handleFieldChange('tags', e.target.value)}
          placeholder="태그1, 태그2, 태그3"
        />
      </div>

      {/* 🎯 메모 */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          메모
        </Label>
        <Textarea
          value={editFields.notes}
          onChange={e => handleFieldChange('notes', e.target.value)}
          placeholder="추가 메모를 입력하세요"
          rows={3}
        />
      </div>
    </div>
  );

  // 🎯 액션 버튼들
  const renderActions = () => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onClose}
        className="flex-1"
        disabled={isLoading}
      >
        <X className="h-4 w-4 mr-2" />
        취소
      </Button>
      <Button
        onClick={handleSave}
        disabled={!hasChanges || isLoading}
        className="flex-1"
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? '저장 중...' : '저장'}
      </Button>
    </div>
  );

  if (!client) return null;

  // 🎯 모바일: Sheet 사용
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              빠른 편집
            </SheetTitle>
          </SheetHeader>

          <div className="py-6">{renderContent()}</div>

          <SheetFooter>{renderActions()}</SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  // 🎯 데스크톱: Dialog 사용
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            빠른 편집
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        <DialogFooter>{renderActions()}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
