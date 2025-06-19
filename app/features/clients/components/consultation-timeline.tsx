import { Button } from '~/common/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { ConsultationNote } from '../types/client-detail';

interface ConsultationTimelineProps {
  consultationNotes: ConsultationNote[];
  onAddNote: () => void;
  onEditNote: (note: ConsultationNote) => void;
  onDeleteNote: (noteId: string) => void;
  onShowDeleteModal: (note: ConsultationNote) => void;
}

export function ConsultationTimeline({
  consultationNotes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onShowDeleteModal,
}: ConsultationTimelineProps) {
  return (
    <>
      {/* 상담 노트 추가 버튼 */}
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-foreground">상담 기록</h4>
        <Button 
          size="sm" 
          onClick={onAddNote}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />새 상담 기록
        </Button>
      </div>

      {/* 상담 기록 타임라인 */}
      <div className="space-y-6">
        {consultationNotes && consultationNotes.length > 0 ? (
          consultationNotes.map((note, index) => (
            <div key={note.id} className="relative pl-8">
              <div className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full"></div>
              {index < consultationNotes.length - 1 && (
                <div className="absolute left-1.5 top-5 w-0.5 h-full bg-border"></div>
              )}

              <div className="border rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-foreground">
                      {note.title}
                    </h5>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>📅 {note.consultationDate}</span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                        상담
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => note.id && onEditNote(note)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShowDeleteModal(note)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h6 className="text-sm font-medium text-muted-foreground mb-1">
                      상담 내용
                    </h6>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>

                  {note.contractInfo && (
                    <div>
                      <h6 className="text-sm font-medium text-muted-foreground mb-1">
                        계약 관련
                      </h6>
                      <div className="bg-accent/20 p-3 rounded border border-border/40">
                        <p className="text-sm whitespace-pre-wrap">
                          {typeof note.contractInfo === 'string' &&
                          note.contractInfo.startsWith('"') &&
                          note.contractInfo.endsWith('"')
                            ? note.contractInfo.slice(1, -1) // 양쪽 쌍따옴표 제거
                            : note.contractInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {(note.followUpDate || note.followUpNotes) && (
                    <div>
                      <h6 className="text-sm font-medium text-muted-foreground mb-1">
                        다음 액션
                      </h6>
                      <div className="flex items-center gap-2 text-sm">
                        {note.followUpDate && (
                          <span className="bg-orange-900 text-orange-100 px-2 py-1 rounded">
                            ✅ {note.followUpDate}
                          </span>
                        )}
                        {note.followUpNotes && (
                          <span>{note.followUpNotes}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          /* 빈 상태 */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h4 className="font-medium text-foreground mb-2">
              상담 기록이 없습니다
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              첫 상담 기록을 추가해보세요.
            </p>
            <Button 
              onClick={onAddNote}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />첫 상담 기록 작성
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
