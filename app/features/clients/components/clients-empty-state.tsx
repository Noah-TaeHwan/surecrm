import { Button } from '~/common/components/ui/button';
import { PlusIcon, PersonIcon, LockClosedIcon } from '@radix-ui/react-icons';

interface ClientsEmptyStateProps {
  onAddClient: () => void;
  hasFilters?: boolean;
  isFiltered?: boolean;
  isSecurityRestricted?: boolean;
}

export function ClientsEmptyState({
  onAddClient,
  hasFilters = false,
  isFiltered = false,
  isSecurityRestricted = false,
}: ClientsEmptyStateProps) {
  if (isSecurityRestricted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted/50 p-6 mb-6">
          <LockClosedIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          접근 제한된 고객 정보
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          현재 보안 설정으로 인해 일부 고객 정보가 제한되어 있습니다.
          <br />
          관리자에게 문의하거나 필터를 조정해 주세요.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          새로고침
        </Button>
      </div>
    );
  }

  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted/50 p-6 mb-6">
          <PersonIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          검색 결과가 없습니다
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          현재 검색 조건에 맞는 고객을 찾을 수 없습니다.
          <br />
          다른 검색어나 필터를 시도해 보세요.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          필터 초기화
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <PersonIcon className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        첫 번째 고객을 추가해보세요
      </h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        아직 등록된 고객이 없습니다. 새 고객을 추가하여 고객 관계 관리를
        시작하세요.
        <br />
        모든 고객 정보는 안전하게 보호됩니다.
      </p>
      <Button onClick={onAddClient} className="gap-2">
        <PlusIcon className="h-4 w-4" />첫 고객 추가하기
      </Button>
    </div>
  );
}
