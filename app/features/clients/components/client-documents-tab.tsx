import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
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
  LockClosedIcon,
  FileTextIcon,
  CalendarIcon,
  PersonIcon,
  ActivityLogIcon,
} from '@radix-ui/react-icons';
import { documentTypeConfig, insuranceTypeConfig } from './insurance-config';
import { AddDocumentModal } from './add-document-modal';
import type { ClientDisplay, ClientPrivacyLevel } from '../types';
import { typeHelpers } from '../types';
import { logDataAccess } from '../lib/client-data';

// 🔧 임시 문서 타입 정의 (실제로는 documents schema에서 import)
interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  description?: string;
  relatedInsuranceId?: string;
  createdAt: string;
  uploadedBy: string;
  confidentialityLevel?: 'public' | 'restricted' | 'private' | 'confidential';
  encrypted?: boolean;
  expiryDate?: string;
  version?: string;
  tags?: string[];
  accessCount?: number;
  lastAccessedAt?: string;
  fileUrl?: string;
  checksum?: string;
}

interface ClientDocumentsTabProps {
  client: ClientDisplay;
  documents: Document[];
  insuranceTypes?: string[];
  agentId: string; // 🔒 보안 로깅용
  onDataAccess?: (accessType: string, data: string[]) => void;
  onDocumentAdded?: (document: Document) => void;
}

export function ClientDocumentsTab({
  client,
  documents,
  insuranceTypes = [],
  agentId,
  onDataAccess,
  onDocumentAdded,
}: ClientDocumentsTabProps) {
  // 🔒 개인정보 표시 제어
  const [showConfidentialData, setShowConfidentialData] = useState(false);
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'public' | 'business'>(
    'business'
  );
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);

  const privacyLevel = (client.accessLevel ||
    client.privacyLevel ||
    'private') as ClientPrivacyLevel;

  // 🔒 데이터 접근 로깅
  const handleDataAccess = async (accessType: string, dataFields: string[]) => {
    try {
      await logDataAccess(
        client.id,
        agentId,
        'view',
        dataFields,
        undefined,
        navigator.userAgent,
        `고객 문서 ${accessType}`
      );
      onDataAccess?.(accessType, dataFields);
    } catch (error) {
      console.error('데이터 접근 로깅 실패:', error);
    }
  };

  // 🔒 데이터 마스킹 함수
  const maskData = (data: string, level: ClientPrivacyLevel = privacyLevel) => {
    return typeHelpers.maskData(data, level, showConfidentialData);
  };

  // 🔒 문서 필터링 (타입 및 보안 레벨)
  const filterDocuments = (documents: Document[]) => {
    return documents.filter(document => {
      // 타입 필터
      if (filterType !== 'all' && document.type !== filterType) {
        return false;
      }

      // 보안 레벨 필터
      const docLevel = document.confidentialityLevel || 'public';
      switch (filterLevel) {
        case 'public':
          return docLevel === 'public';
        case 'business':
          return ['public', 'restricted'].includes(docLevel);
        case 'all':
          return (
            ['public', 'restricted', 'private'].includes(docLevel) ||
            showConfidentialData
          );
        default:
          return true;
      }
    });
  };

  // 🔒 기밀 레벨에 따른 배지
  const getConfidentialityBadge = (level?: string) => {
    switch (level) {
      case 'confidential':
        return (
          <Badge variant="destructive" className="text-xs">
            기밀
          </Badge>
        );
      case 'private':
        return (
          <Badge variant="secondary" className="text-xs">
            내부
          </Badge>
        );
      case 'restricted':
        return (
          <Badge variant="outline" className="text-xs">
            제한
          </Badge>
        );
      case 'public':
        return (
          <Badge variant="default" className="text-xs">
            공개
          </Badge>
        );
      default:
        return null;
    }
  };

  // 🔒 문서 작업 로깅
  const handleDocumentAction = async (action: string, document: Document) => {
    await handleDataAccess(`문서 ${action}`, [
      'documents',
      document.id,
      action,
    ]);
  };

  const handleDocumentAdded = async (newDocument: Document) => {
    await handleDataAccess('새 문서 추가', ['documents', 'create']);
    onDocumentAdded?.(newDocument);
  };

  const filteredDocuments = filterDocuments(documents);

  // 고유 문서 타입 목록
  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));

  return (
    <div className="space-y-6">
      {/* 🔒 보안 및 필터 컨트롤 헤더 */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <LockClosedIcon className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">문서 필터:</span>

                {/* 타입 필터 */}
                <Select
                  value={filterType}
                  onValueChange={(value: any) => {
                    setFilterType(value);
                    handleDataAccess(`타입 필터 변경: ${value}`, [
                      'filter_settings',
                    ]);
                  }}
                >
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 타입</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {documentTypeConfig[type]?.label || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 보안 레벨 필터 */}
                <Select
                  value={filterLevel}
                  onValueChange={(value: any) => {
                    setFilterLevel(value);
                    handleDataAccess(`보안 필터 변경: ${value}`, [
                      'filter_settings',
                    ]);
                  }}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">공개</SelectItem>
                    <SelectItem value="business">업무</SelectItem>
                    <SelectItem value="all">전체</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-confidential-docs" className="text-xs">
                  기밀정보 표시
                </Label>
                <Switch
                  id="show-confidential-docs"
                  checked={showConfidentialData}
                  onCheckedChange={checked => {
                    setShowConfidentialData(checked);
                    handleDataAccess(
                      checked ? '기밀정보 표시' : '기밀정보 숨김',
                      ['privacy_settings']
                    );
                  }}
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredDocuments.length}개 문서
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 문서 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              문서 관리
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LockClosedIcon className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>모든 접근이 로그에 기록됩니다</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setIsAddDocumentOpen(true);
                handleDataAccess('문서 업로드 모달 열기', [
                  'documents',
                  'upload_modal',
                ]);
              }}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              문서 업로드
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map(document => {
                const config = documentTypeConfig[document.type] || {
                  label: document.type,
                  icon: <FileTextIcon className="h-4 w-4" />,
                };
                const relatedInsurance = document.relatedInsuranceId
                  ? insuranceTypeConfig[document.relatedInsuranceId]
                  : null;

                return (
                  <Card
                    key={document.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">{config.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {maskData(document.name, privacyLevel)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {config.label} • {document.size}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {getConfidentialityBadge(
                              document.confidentialityLevel
                            )}
                            {document.encrypted && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <LockClosedIcon className="h-3 w-3 text-green-600" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>암호화된 문서</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
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
                          <DropdownMenuItem
                            onClick={() =>
                              handleDocumentAction('보기', document)
                            }
                          >
                            <EyeOpenIcon className="mr-2 h-3 w-3" />
                            보기
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDocumentAction('다운로드', document)
                            }
                          >
                            <DownloadIcon className="mr-2 h-3 w-3" />
                            다운로드
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleDocumentAction('삭제', document)
                            }
                          >
                            <TrashIcon className="mr-2 h-3 w-3" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* 문서 설명 */}
                    {document.description && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {maskData(document.description, privacyLevel)}
                      </div>
                    )}

                    {/* 관련 보험 정보 */}
                    {relatedInsurance && (
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">
                          {relatedInsurance.label}
                        </Badge>
                      </div>
                    )}

                    {/* 태그 */}
                    {document.tags && document.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {document.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* 문서 메타데이터 */}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {maskData(document.createdAt, 'private')} 업로드
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <PersonIcon className="h-3 w-3" />
                        {maskData(document.uploadedBy, privacyLevel)}
                      </div>

                      {document.version && (
                        <div className="text-xs text-muted-foreground">
                          버전 {document.version}
                        </div>
                      )}

                      {document.accessCount && showConfidentialData && (
                        <div className="text-xs text-muted-foreground">
                          {document.accessCount}회 조회
                        </div>
                      )}

                      {document.expiryDate && (
                        <div className="text-xs text-yellow-600 font-medium">
                          만료일: {maskData(document.expiryDate, 'private')}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* 빈 상태 */
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {filterType !== 'all' || filterLevel !== 'all'
                  ? '조건에 맞는 문서가 없습니다'
                  : '문서가 없습니다'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filterType !== 'all' || filterLevel !== 'all'
                  ? '필터 설정을 변경하거나 새 문서를 업로드해보세요.'
                  : '고객의 첫 번째 문서를 업로드해보세요.'}
              </p>
              <Button onClick={() => setIsAddDocumentOpen(true)}>
                <UploadIcon className="mr-2 h-4 w-4" />
                문서 업로드
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔒 문서 통계 */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <ActivityLogIcon className="h-5 w-5" />
            문서 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredDocuments.length}
              </div>
              <div className="text-sm text-muted-foreground">총 문서</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredDocuments.filter(d => d.encrypted).length}
              </div>
              <div className="text-sm text-muted-foreground">암호화</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredDocuments.map(d => d.type)).size}
              </div>
              <div className="text-sm text-muted-foreground">문서 유형</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {
                  filteredDocuments.filter(
                    d => d.confidentialityLevel === 'confidential'
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">기밀 문서</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 문서 업로드 모달 */}
      <AddDocumentModal
        open={isAddDocumentOpen}
        onOpenChange={setIsAddDocumentOpen}
        clientId={client.id}
        clientName={typeHelpers.getClientDisplayName(client)}
        insuranceTypes={insuranceTypes}
        onDocumentAdded={handleDocumentAdded}
      />
    </div>
  );
}
