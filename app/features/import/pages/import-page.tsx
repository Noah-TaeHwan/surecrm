import type { Route } from '.react-router/types/app/features/import/pages/+types/import-page';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Input } from '~/common/components/ui/input';
import { Badge } from '~/common/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Label } from '~/common/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Progress } from '~/common/components/ui/progress';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  FileIcon,
  UploadIcon,
  CheckIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  DownloadIcon,
  ReloadIcon,
  MagnifyingGlassIcon,
  Link2Icon,
  ArrowRightIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState, useCallback } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기

  // 임포트 히스토리
  const importHistory = [
    {
      id: '1',
      fileName: 'customers_2024_01.csv',
      sourceType: 'csv',
      uploadDate: '2024-01-20',
      status: 'completed',
      totalRows: 150,
      successRows: 142,
      errorRows: 8,
      duplicates: 3,
      mapping: {
        name: '이름',
        phone: '전화번호',
        email: '이메일',
        company: '회사명',
      },
    },
    {
      id: '2',
      fileName: 'google_contacts.xlsx',
      sourceType: 'excel',
      uploadDate: '2024-01-18',
      status: 'completed',
      totalRows: 89,
      successRows: 85,
      errorRows: 4,
      duplicates: 2,
      mapping: {
        name: 'Name',
        phone: 'Phone 1 - Value',
        email: 'E-mail 1 - Value',
      },
    },
    {
      id: '3',
      fileName: 'failed_import.csv',
      sourceType: 'csv',
      uploadDate: '2024-01-15',
      status: 'failed',
      totalRows: 0,
      successRows: 0,
      errorRows: 0,
      duplicates: 0,
      error: '파일 형식이 올바르지 않습니다',
    },
  ];

  // 필드 매핑 옵션
  const fieldMappings = {
    required: [
      { key: 'name', label: '이름', required: true },
      { key: 'phone', label: '전화번호', required: true },
    ],
    optional: [
      { key: 'email', label: '이메일', required: false },
      { key: 'company', label: '회사명', required: false },
      { key: 'position', label: '직책', required: false },
      { key: 'address', label: '주소', required: false },
      { key: 'notes', label: '메모', required: false },
      { key: 'referredBy', label: '소개자', required: false },
      { key: 'tags', label: '태그', required: false },
    ],
  };

  return { importHistory, fieldMappings };
}

export function action({ request }: Route.ActionArgs) {
  // TODO: 실제 파일 업로드 및 처리 로직
  return { success: true };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '데이터 임포트 - SureCRM' },
    {
      name: 'description',
      content: '고객 데이터를 CSV, 엑셀 등에서 가져옵니다',
    },
  ];
}

export default function ImportPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { importHistory, fieldMappings } = loaderData;

  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [importStep, setImportStep] = useState('upload'); // upload, mapping, validation, complete

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        // 파일 미리보기 로직 (실제로는 서버에서 처리)
        simulateFileProcessing(file);
      }
    },
    []
  );

  // 파일 처리 시뮬레이션
  const simulateFileProcessing = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // 진행률 시뮬레이션
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          // 예시 데이터 생성
          const mockColumns = ['Name', 'Phone', 'Email', 'Company', 'Position'];
          const mockData = [
            ['김영희', '010-1234-5678', 'kim@example.com', 'ABC 회사', '팀장'],
            ['이철수', '010-9876-5432', 'lee@example.com', 'XYZ 기업', '과장'],
            [
              '박지민',
              '010-2345-6789',
              'park@example.com',
              '대한 기업',
              '부장',
            ],
          ];

          setDetectedColumns(mockColumns);
          setPreviewData(mockData);
          setImportStep('mapping');

          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      simulateFileProcessing(files[0]);
    }
  };

  // 매핑 완료 핸들러
  const handleMappingComplete = () => {
    // 데이터 검증 시뮬레이션
    const validationResults = [
      {
        row: 1,
        field: 'phone',
        issue: '전화번호 형식 오류',
        data: '010-1234-567',
        suggestion: '010-1234-5678',
      },
      {
        row: 3,
        field: 'email',
        issue: '중복 이메일',
        data: 'park@example.com',
        suggestion: '건너뛰기',
      },
    ];

    setValidationResults(validationResults);
    setImportStep('validation');
  };

  // 임포트 완료 핸들러
  const handleImportComplete = () => {
    console.log('임포트 완료');
    setImportStep('complete');
  };

  // 상태별 배지 색상
  const statusBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    completed: 'default',
    failed: 'destructive',
    processing: 'outline',
  };

  const statusText: Record<string, string> = {
    completed: '완료',
    failed: '실패',
    processing: '처리 중',
  };

  return (
    <MainLayout title="데이터 임포트">
      <div className="container mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">데이터 임포트</h1>
            <p className="text-muted-foreground">
              기존 고객 데이터를 SureCRM으로 가져오세요
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/templates/import_template.csv" download>
              <DownloadIcon className="mr-2 h-4 w-4" />
              템플릿 다운로드
            </a>
          </Button>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upload">새 임포트</TabsTrigger>
            <TabsTrigger value="history">임포트 히스토리</TabsTrigger>
          </TabsList>

          {/* 새 임포트 탭 */}
          <TabsContent value="upload" className="mt-6">
            {importStep === 'upload' && (
              <Card>
                <CardHeader>
                  <CardTitle>파일 업로드</CardTitle>
                  <CardDescription>
                    CSV, 엑셀 파일을 업로드하거나 드래그 앤 드롭으로 추가하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 지원 형식 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-8 w-8 text-green-600" />
                          <div>
                            <div className="font-medium">CSV 파일</div>
                            <div className="text-sm text-muted-foreground">
                              쉼표로 구분된 값
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-8 w-8 text-blue-600" />
                          <div>
                            <div className="font-medium">Excel 파일</div>
                            <div className="text-sm text-muted-foreground">
                              .xlsx, .xls 형식
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Link2Icon className="h-8 w-8 text-purple-600" />
                          <div>
                            <div className="font-medium">구글 연락처</div>
                            <div className="text-sm text-muted-foreground">
                              곧 지원 예정
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* 파일 업로드 영역 */}
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {isUploading ? (
                        <div className="space-y-4">
                          <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
                          <div>
                            <div className="text-lg font-medium">
                              파일 업로드 중...
                            </div>
                            <Progress
                              value={uploadProgress}
                              className="mt-2 max-w-xs mx-auto"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              {uploadProgress}% 완료
                            </div>
                          </div>
                        </div>
                      ) : selectedFile ? (
                        <div className="space-y-4">
                          <CheckIcon className="h-12 w-12 text-green-600 mx-auto" />
                          <div>
                            <div className="text-lg font-medium">
                              {selectedFile.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                          <Button
                            onClick={() => setSelectedFile(null)}
                            variant="outline"
                          >
                            다른 파일 선택
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                          <div>
                            <div className="text-lg font-medium">
                              파일을 드래그 앤 드롭하거나 클릭하여 업로드
                            </div>
                            <div className="text-sm text-muted-foreground">
                              최대 10MB, CSV/Excel 파일만 지원
                            </div>
                          </div>
                          <div>
                            <Input
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="file-upload"
                            />
                            <Button asChild>
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer"
                              >
                                파일 선택
                              </label>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {importStep === 'mapping' && (
              <Card>
                <CardHeader>
                  <CardTitle>필드 매핑</CardTitle>
                  <CardDescription>
                    업로드한 파일의 컬럼을 SureCRM 필드와 연결하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 미리보기 */}
                    <div>
                      <Label className="text-base font-medium">
                        데이터 미리보기
                      </Label>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {detectedColumns.map((col, index) => (
                                <TableHead key={index}>{col}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.slice(0, 3).map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell: string, cellIndex: number) => (
                                  <TableCell key={cellIndex}>{cell}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        처음 3개 행만 표시됩니다
                      </p>
                    </div>

                    {/* 매핑 설정 */}
                    <div>
                      <Label className="text-base font-medium">필드 매핑</Label>
                      <div className="mt-4 space-y-4">
                        {/* 필수 필드 */}
                        <div>
                          <Label className="text-sm font-medium text-red-600">
                            필수 필드
                          </Label>
                          <div className="mt-2 space-y-3">
                            {fieldMappings.required.map((field) => (
                              <div
                                key={field.key}
                                className="grid grid-cols-3 gap-4 items-center"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {field.label}
                                  </span>
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    필수
                                  </Badge>
                                </div>
                                <ArrowRightIcon className="h-4 w-4 justify-self-center" />
                                <Select
                                  value={columnMapping[field.key] || ''}
                                  onValueChange={(value) =>
                                    setColumnMapping((prev) => ({
                                      ...prev,
                                      [field.key]: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="컬럼 선택" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">선택 안함</SelectItem>
                                    {detectedColumns.map((col) => (
                                      <SelectItem key={col} value={col}>
                                        {col}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 선택 필드 */}
                        <div>
                          <Label className="text-sm font-medium">
                            선택 필드
                          </Label>
                          <div className="mt-2 space-y-3">
                            {fieldMappings.optional.map((field) => (
                              <div
                                key={field.key}
                                className="grid grid-cols-3 gap-4 items-center"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{field.label}</span>
                                  <Badge variant="outline" className="text-xs">
                                    선택
                                  </Badge>
                                </div>
                                <ArrowRightIcon className="h-4 w-4 justify-self-center" />
                                <Select
                                  value={columnMapping[field.key] || ''}
                                  onValueChange={(value) =>
                                    setColumnMapping((prev) => ({
                                      ...prev,
                                      [field.key]: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="컬럼 선택" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">선택 안함</SelectItem>
                                    {detectedColumns.map((col) => (
                                      <SelectItem key={col} value={col}>
                                        {col}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setImportStep('upload')}
                      >
                        이전
                      </Button>
                      <Button onClick={handleMappingComplete}>
                        다음: 데이터 검증
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {importStep === 'validation' && (
              <Card>
                <CardHeader>
                  <CardTitle>데이터 검증</CardTitle>
                  <CardDescription>
                    데이터 오류를 확인하고 수정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 검증 결과 요약 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            142
                          </div>
                          <div className="text-sm text-muted-foreground">
                            정상 데이터
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            5
                          </div>
                          <div className="text-sm text-muted-foreground">
                            경고
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            3
                          </div>
                          <div className="text-sm text-muted-foreground">
                            오류
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            2
                          </div>
                          <div className="text-sm text-muted-foreground">
                            중복
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* 문제가 있는 데이터 */}
                    {validationResults.length > 0 && (
                      <div>
                        <Label className="text-base font-medium">
                          수정 필요한 데이터
                        </Label>
                        <div className="mt-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>행</TableHead>
                                <TableHead>필드</TableHead>
                                <TableHead>문제</TableHead>
                                <TableHead>현재 값</TableHead>
                                <TableHead>제안</TableHead>
                                <TableHead>작업</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {validationResults.map((result, index) => (
                                <TableRow key={index}>
                                  <TableCell>{result.row}</TableCell>
                                  <TableCell>{result.field}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="gap-1">
                                      <ExclamationTriangleIcon className="h-3 w-3" />
                                      {result.issue}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{result.data}</TableCell>
                                  <TableCell>{result.suggestion}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="outline">
                                        수정
                                      </Button>
                                      <Button size="sm" variant="ghost">
                                        건너뛰기
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setImportStep('mapping')}
                      >
                        이전
                      </Button>
                      <Button onClick={handleImportComplete}>
                        임포트 실행
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {importStep === 'complete' && (
              <Card>
                <CardHeader>
                  <CardTitle>임포트 완료</CardTitle>
                  <CardDescription>
                    데이터 임포트가 성공적으로 완료되었습니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <CheckIcon className="h-16 w-16 text-green-600 mx-auto" />
                    <div>
                      <div className="text-lg font-medium">
                        142명의 고객이 추가되었습니다
                      </div>
                      <div className="text-sm text-muted-foreground">
                        3개의 오류가 있었으며, 2개의 중복 데이터가
                        건너뛰어졌습니다
                      </div>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button asChild>
                        <Link to="/clients">고객 목록 보기</Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setImportStep('upload');
                          setSelectedFile(null);
                          setColumnMapping({});
                        }}
                      >
                        새 임포트
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 임포트 히스토리 탭 */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>임포트 히스토리</CardTitle>
                <CardDescription>
                  이전에 수행한 모든 데이터 임포트 기록
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>파일명</TableHead>
                      <TableHead>소스</TableHead>
                      <TableHead>업로드일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>총 행수</TableHead>
                      <TableHead>성공</TableHead>
                      <TableHead>오류</TableHead>
                      <TableHead>중복</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.fileName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.sourceType.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.uploadDate}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant[item.status]}>
                            {statusText[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.totalRows}</TableCell>
                        <TableCell className="text-green-600">
                          {item.successRows}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {item.errorRows}
                        </TableCell>
                        <TableCell className="text-yellow-600">
                          {item.duplicates}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost">
                              <MagnifyingGlassIcon className="h-4 w-4" />
                            </Button>
                            {item.status === 'failed' && (
                              <Button size="sm" variant="ghost">
                                <ReloadIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
