import { Card, CardContent } from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { PersonIcon, PlusIcon } from '@radix-ui/react-icons';

interface ClientsEmptyStateProps {
  onAddClick: () => void;
}

export function ClientsEmptyState({ onAddClick }: ClientsEmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <PersonIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">
          아직 등록된 고객이 없습니다
        </h3>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          첫 번째 고객을 추가하여 보험 영업 관리를 시작하세요. 개별 등록 또는
          엑셀 파일로 일괄 등록이 가능합니다.
        </p>
        <Button className="mt-4" onClick={onAddClick}>
          <PlusIcon className="mr-2 h-4 w-4" />첫 고객 추가하기
        </Button>

        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            고객 관리 기능
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              보안 강화된 개인정보 관리
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              소개 네트워크 추적
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              영업 단계별 관리
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
