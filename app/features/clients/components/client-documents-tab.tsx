import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import {
  UploadIcon,
  DotsHorizontalIcon,
  EyeOpenIcon,
  DownloadIcon,
  TrashIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { documentTypeConfig, insuranceTypeConfig } from './insurance-config';
import { AddDocumentModal } from './add-document-modal';
import type { Document } from './types';

interface ClientDocumentsTabProps {
  documents: Document[];
  clientId: string;
  clientName: string;
  insuranceTypes?: string[];
}

export function ClientDocumentsTab({
  documents,
  clientId,
  clientName,
  insuranceTypes = [],
}: ClientDocumentsTabProps) {
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);

  const handleDocumentAdded = (newDocument: any) => {
    // TODO: 실제 API 호출로 문서 추가
    console.log('새 문서 추가됨:', newDocument);
    // 상태 업데이트 또는 새로고침 로직
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            문서 관리
            <Button size="sm" onClick={() => setIsAddDocumentOpen(true)}>
              <UploadIcon className="mr-2 h-4 w-4" />
              문서 업로드
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => {
                const config = documentTypeConfig[document.type];
                const relatedInsurance = document.relatedInsurance
                  ? insuranceTypeConfig[document.relatedInsurance]
                  : null;

                return (
                  <Card key={document.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <div>
                          <div className="font-medium text-sm">
                            {document.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {config.label} • {document.size}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <EyeOpenIcon className="mr-2 h-3 w-3" />
                            보기
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DownloadIcon className="mr-2 h-3 w-3" />
                            다운로드
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <TrashIcon className="mr-2 h-3 w-3" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {document.description && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {document.description}
                      </div>
                    )}

                    {relatedInsurance && (
                      <Badge variant="outline" className="text-xs">
                        {relatedInsurance.label}
                      </Badge>
                    )}

                    <div className="text-xs text-muted-foreground mt-2">
                      {document.uploadDate} 업로드
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* 빈 상태 */
            <div className="text-center py-10">
              <div className="text-muted-foreground mb-4">
                <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">문서가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                고객의 첫 번째 문서를 업로드해보세요.
              </p>
              <Button onClick={() => setIsAddDocumentOpen(true)}>
                <UploadIcon className="mr-2 h-4 w-4" />
                문서 업로드
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 문서 업로드 모달 */}
      <AddDocumentModal
        open={isAddDocumentOpen}
        onOpenChange={setIsAddDocumentOpen}
        clientId={clientId}
        clientName={clientName}
        insuranceTypes={insuranceTypes}
        onDocumentAdded={handleDocumentAdded}
      />
    </div>
  );
}
