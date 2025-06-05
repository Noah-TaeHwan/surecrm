import { Button } from '~/common/components/ui/button';
import { Textarea } from '~/common/components/ui/textarea';
import { FileText, Plus } from 'lucide-react';

interface ClientMemoSectionProps {
  isEditing: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  onEditStart: () => void;
}

export function ClientMemoSection({
  isEditing,
  notes,
  onNotesChange,
  onEditStart,
}: ClientMemoSectionProps) {
  return (
    <div>
      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        고객 메모 및 특이사항
      </h4>
      <div className="p-4 bg-muted/20 rounded-lg border border-border/40">
        {isEditing ? (
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="고객에 대한 메모를 입력하세요..."
            className="min-h-[120px] resize-none border-none p-0 bg-transparent"
          />
        ) : notes ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{notes}</p>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              메모가 없습니다
            </p>
            <Button variant="outline" size="sm" onClick={onEditStart}>
              <Plus className="h-3 w-3 mr-1" />
              메모 추가
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
