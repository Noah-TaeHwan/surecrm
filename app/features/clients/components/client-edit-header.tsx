import { Button } from '~/common/components/ui/button';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { ArrowLeft, User, X } from 'lucide-react';

interface ClientEditHeaderProps {
  clientName: string;
  onCancel: () => void;
  error?: string | null;
}

export function ClientEditHeader({
  clientName,
  onCancel,
  error,
}: ClientEditHeaderProps) {
  return (
    <div className="space-y-6">
      {/* 🎯 현대적인 헤더 */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-2xl"></div>
        <div className="relative p-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {clientName} 정보 수정
              </h1>
              <p className="text-muted-foreground mt-1">
                고객 정보를 업데이트하여 더 나은 서비스를 제공하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {error && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 dark:bg-red-900/10"
        >
          <X className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
