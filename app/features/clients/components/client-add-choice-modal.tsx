import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Card, CardContent, CardFooter } from '~/common/components/ui/card';
import {
  PlusIcon,
  UploadIcon,
  PersonIcon,
  FileTextIcon,
} from '@radix-ui/react-icons';

interface ClientAddChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoiceSelect: (choice: 'individual' | 'import') => void;
}

export function ClientAddChoiceModal({
  open,
  onOpenChange,
  onChoiceSelect,
}: ClientAddChoiceModalProps) {
  const handleChoice = (choice: 'individual' | 'import') => {
    onChoiceSelect(choice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw]">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-semibold">
            고객을 어떻게 추가하시겠습니까?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            새로운 고객을 개별로 추가하거나, 기존 데이터를 일괄로 가져올 수
            있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* 개별 고객 추가 옵션 */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30 group border border-border hover:bg-accent/30"
            onClick={() => handleChoice('individual')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/15 transition-colors flex-shrink-0">
                  <PersonIcon className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      개별 고객 추가
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      새로운 고객의 정보를 직접 입력하여 체계적으로 관리를
                      시작합니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 bg-primary/60 rounded-full flex-shrink-0"></div>
                      <span>기본 정보 및 연락처 입력</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 bg-primary/60 rounded-full flex-shrink-0"></div>
                      <span>영업 단계 및 중요도 설정</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 bg-primary/60 rounded-full flex-shrink-0"></div>
                      <span>소개 관계 연결 및 태그 관리</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 일괄 데이터 import 옵션 */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30 group border border-border hover:bg-accent/30"
            onClick={() => handleChoice('import')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/15 transition-colors flex-shrink-0">
                  <UploadIcon className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      기존 데이터 가져오기
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      엑셀, CSV 파일로 여러 고객을 한번에 빠르게 추가합니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 bg-primary/60 rounded-full flex-shrink-0"></div>
                      <span>CSV, 엑셀 파일 자동 인식</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 bg-primary/60 rounded-full flex-shrink-0"></div>
                      <span>필드 자동 매핑 및 검증</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 bg-primary/60 rounded-full flex-shrink-0"></div>
                      <span>데이터 정리 및 중복 제거</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 추가 정보 */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">💡</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">팁:</span> 기존에
              관리하던 고객이 많다면 "데이터 가져오기"를 추천합니다. 시간을 크게
              절약하고 체계적인 관리를 바로 시작할 수 있습니다.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
