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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h4 className="font-medium text-foreground text-sm sm:text-base">
          상담 기록
        </h4>
        <Button
          size="sm"
          onClick={onAddNote}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />새 상담 기록
        </Button>
      </div>

      {/* 상담 기록 타임라인 */}
      <div className="space-y-6">
        {consultationNotes && consultationNotes.length > 0 ? (
          consultationNotes.map((note, index) => (
            <div key={note.id} className="relative sm:pl-8">
              {/* 타임라인 도트 - 데스크톱에서만 표시 */}
              <div className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full hidden sm:block"></div>
              {index < consultationNotes.length - 1 && (
                <div className="absolute left-1.5 top-5 w-0.5 h-full bg-border hidden sm:block"></div>
              )}

              <div className="border rounded-lg p-3 sm:p-4 shadow-sm">
                {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-foreground text-sm sm:text-base mb-2 sm:mb-1">
                      {note.title}
                    </h5>
                    {/* 모바일: 세로 배치 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        📅 {note.consultationDate}
                      </span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs w-fit">
                        상담
                      </span>
                    </div>
                  </div>
                  {/* 액션 버튼들 - 모바일에서 전체 폭 */}
                  <div className="flex gap-2 sm:gap-1 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => note.id && onEditNote(note)}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden">편집</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShowDeleteModal(note)}
                      className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden">삭제</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-3">
                  <div>
                    <h6 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                      상담 내용
                    </h6>
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-muted/10 p-2 sm:p-3 rounded border border-border/20">
                      {note.content}
                    </p>
                  </div>

                  {note.contractInfo && (
                    <div>
                      <h6 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                        계약 관련
                      </h6>
                      <div className="bg-accent/20 p-2 sm:p-3 rounded border border-border/40">
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">
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
                      <h6 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                        다음 액션
                      </h6>
                      {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                        {note.followUpDate && (
                          <span className="bg-orange-900 text-orange-100 px-2 py-1 rounded text-xs w-fit">
                            ✅ {note.followUpDate}
                          </span>
                        )}
                        {note.followUpNotes && (
                          <span className="text-xs sm:text-sm">
                            {note.followUpNotes}
                          </span>
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
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">📝</span>
            </div>
            <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">
              상담 기록이 없습니다
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              첫 상담 기록을 추가해보세요.
            </p>
            <Button
              onClick={onAddNote}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />첫 상담 기록 작성
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
