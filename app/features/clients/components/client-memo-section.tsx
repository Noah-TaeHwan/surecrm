import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { Textarea } from '~/common/components/ui/textarea';
import { FileText, Plus, Edit2, Save, X } from 'lucide-react';

interface ClientMemoSectionProps {
  notes: string;
  onSave: (notes: string) => Promise<void>; // 메모 저장 함수
}

export function ClientMemoSection({
  notes,
  onSave,
}: ClientMemoSectionProps) {
  // 메모 편집을 위한 독립적인 상태
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [editingNotes, setEditingNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);

  // 편집 시작
  const handleEditStart = () => {
    setEditingNotes(notes);
    setIsEditingMemo(true);
  };

  // 편집 취소
  const handleEditCancel = () => {
    setEditingNotes(notes);
    setIsEditingMemo(false);
  };

  // 메모 저장
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(editingNotes);
      setIsEditingMemo(false);
    } catch (error) {
      console.error('메모 저장 실패:', error);
      // 에러 처리는 상위 컴포넌트에서 처리됨
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5" />
          고객 메모 및 특이사항
        </h4>
        
        {/* 편집/저장/취소 버튼 */}
        {!isEditingMemo && notes && (
          <Button 
            onClick={handleEditStart}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            편집
          </Button>
        )}
        
        {isEditingMemo && (
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              size="sm"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? '저장 중...' : '메모 저장'}
            </Button>
            <Button 
              onClick={handleEditCancel}
              size="sm"
              variant="outline"
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" />
              취소
            </Button>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-muted/20 rounded-lg border border-border/40">
        {isEditingMemo ? (
          <Textarea
            value={editingNotes}
            onChange={e => setEditingNotes(e.target.value)}
            placeholder="고객에 대한 메모를 입력하세요..."
            className="min-h-[120px] resize-none border-none p-0 bg-transparent"
            disabled={isSaving}
          />
        ) : notes ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{notes}</p>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              메모가 없습니다
            </p>
            <Button 
              size="sm" 
              onClick={handleEditStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-3 w-3 mr-1" />
              메모 추가
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
