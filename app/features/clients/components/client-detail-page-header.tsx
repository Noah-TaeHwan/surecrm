import { Link } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { ArrowLeft, Edit2, Plus, Save, X, Trash2 } from 'lucide-react';

interface ClientDetailPageHeaderProps {
  clientName: string;
  isEditing: boolean;
  isDeleting: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onDeleteClient: () => void;
  onShowOpportunityModal: () => void;
}

export function ClientDetailPageHeader({
  clientName,
  isEditing,
  isDeleting,
  onEditStart,
  onEditCancel,
  onEditSave,
  onDeleteClient,
  onShowOpportunityModal,
}: ClientDetailPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            고객 목록
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* 🚀 새 영업 기회 추가 (핵심 기능) */}
        <Button variant="outline" onClick={onShowOpportunityModal}>
          <Plus className="h-4 w-4 mr-2" />새 영업 기회
        </Button>

        {!isEditing ? (
          <Button variant="outline" onClick={onEditStart}>
            <Edit2 className="h-4 w-4 mr-2" />
            수정
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEditCancel}>
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button onClick={onEditSave}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          onClick={onDeleteClient}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? '삭제 중...' : '삭제'}
        </Button>
      </div>
    </div>
  );
}
