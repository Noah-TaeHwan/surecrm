import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Progress } from '~/common/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Badge } from '~/common/components/ui/badge';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import {
  UploadIcon,
  CheckIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  DownloadIcon,
  FileTextIcon,
} from '@radix-ui/react-icons';

interface ClientImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 더미 데이터 생성 함수
const generateMockDataFromFile = (fileName: string) => {
  const columns = [
    '이름',
    '전화번호',
    '이메일',
    '회사명',
    '직책',
    '주소',
    '가입보험종류',
    '메모',
  ];
  const data = [
    [
      '김영희',
      '010-1234-5678',
      'kim@example.com',
      'ABC 회사',
      '팀장',
      '서울시 강남구',
      '건강보험, 자동차보험',
      'VIP 고객',
    ],
    [
      '이철수',
      '010-9876-5432',
      'lee@example.com',
      'XYZ 기업',
      '과장',
      '서울시 서초구',
      '생명보험',
      '기존 거래처',
    ],
    [
      '박지민',
      '010-2345-6789',
      'park@example.com',
      '대한 기업',
      '부장',
      '경기도 성남시',
      '건강보험, 생명보험, 재산보험',
      '소개받은 고객',
    ],
    [
      '최민수',
      '010-3456-7890',
      'choi@example.com',
      '스타트업 Inc',
      '대표',
      '서울시 마포구',
      '자동차보험',
      '신규 개발',
    ],
    [
      '정수연',
      '010-4567-8901',
      'jung@example.com',
      '글로벌 코프',
      '차장',
      '인천시 연수구',
      '태아보험, 건강보험',
      '추천받음',
    ],
    [
      '한동훈',
      '010-5678-9012',
      'han@example.com',
      '테크 솔루션',
      '부장',
      '서울시 용산구',
      '재산보험',
      '기업 고객',
    ],
    [
      '윤미라',
      '010-6789-0123',
      'yoon@example.com',
      '디지털 미디어',
      '팀장',
      '서울시 송파구',
      '건강보험',
      '미팅 예정',
    ],
    [
      '장세희',
      '010-7890-1234',
      'jang@example.com',
      '바이오 연구소',
      '연구원',
      '대전시 유성구',
      '생명보험, 건강보험',
      '연구직',
    ],
    [
      '오준석',
      '010-8901-2345',
      'oh@example.com',
      '건설 그룹',
      '이사',
      '부산시 해운대구',
      '재산보험, 자동차보험',
      '대기업',
    ],
    [
      '임수진',
      '010-9012-3456',
      'lim@example.com',
      '교육 재단',
      '팀장',
      '광주시 서구',
      '건강보험',
      '교육기관',
    ],
  ];

  return { columns, data };
};

// 검증 결과 생성 함수
const generateValidationResults = (data: any[]) => {
  const results = [];

  // 몇 가지 의도적인 문제들 생성
  if (data.length > 2) {
    results.push({
      row: 3,
      field: 'phone',
      issue: '전화번호 형식 오류',
      data: '010-987-5432',
      suggestion: '010-9876-5432',
      severity: 'warning',
    });
  }

  if (data.length > 5) {
    results.push({
      row: 6,
      field: 'email',
      issue: '중복 이메일',
      data: 'han@example.com',
      suggestion: '건너뛰기',
      severity: 'error',
    });
  }

  if (data.length > 8) {
    results.push({
      row: 9,
      field: 'name',
      issue: '빈 필드',
      data: '',
      suggestion: '행 건너뛰기',
      severity: 'error',
    });
  }

  return results;
};

export function ClientImportModal({
  open,
  onOpenChange,
}: ClientImportModalProps) {
  const [currentStep, setCurrentStep] = useState<
    'upload' | 'mapping' | 'preview' | 'complete'
  >('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: '',
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 알림 표시 함수
  const showAlert = (title: string, message: string) => {
    setAlertModal({
      open: true,
      title,
      message,
    });
  };

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
      { key: 'insuranceTypes', label: '가입 보험 종류', required: false },
      { key: 'notes', label: '메모', required: false },
      { key: 'referredBy', label: '소개자', required: false },
      { key: 'tags', label: '태그', required: false },
    ],
  };

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback((file: File) => {
    setSelectedFile(file);
    simulateFileProcessing(file);
  }, []);

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 파일 처리 시뮬레이션
  const simulateFileProcessing = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          // 실제 파일 이름을 기반으로 더미 데이터 생성
          const { columns, data } = generateMockDataFromFile(file.name);

          setDetectedColumns(columns);
          setPreviewData(data);

          // 자동으로 필드 매핑 시도
          const autoMapping: Record<string, string> = {};
          columns.forEach((col) => {
            const lowerCol = col.toLowerCase();
            if (lowerCol.includes('이름') || lowerCol.includes('name')) {
              autoMapping['name'] = col;
            } else if (
              lowerCol.includes('전화') ||
              lowerCol.includes('phone')
            ) {
              autoMapping['phone'] = col;
            } else if (
              lowerCol.includes('이메일') ||
              lowerCol.includes('email')
            ) {
              autoMapping['email'] = col;
            } else if (
              lowerCol.includes('회사') ||
              lowerCol.includes('company')
            ) {
              autoMapping['company'] = col;
            } else if (
              lowerCol.includes('직책') ||
              lowerCol.includes('position')
            ) {
              autoMapping['position'] = col;
            } else if (
              lowerCol.includes('주소') ||
              lowerCol.includes('address')
            ) {
              autoMapping['address'] = col;
            } else if (
              lowerCol.includes('보험') ||
              lowerCol.includes('insurance')
            ) {
              autoMapping['insuranceTypes'] = col;
            } else if (lowerCol.includes('메모') || lowerCol.includes('note')) {
              autoMapping['notes'] = col;
            }
          });

          setColumnMapping(autoMapping);
          setCurrentStep('mapping');

          return 100;
        }
        const next = prev + 15;
        return next > 100 ? 100 : next;
      });
    }, 200);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // 파일 형식 검증
      if (
        file.name.endsWith('.csv') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        handleFileUpload(file);
      } else {
        showAlert('파일 형식 오류', 'CSV 또는 Excel 파일만 업로드 가능합니다.');
      }
    }
  };

  // 매핑 완료 핸들러
  const handleMappingComplete = () => {
    // 필수 필드 체크 - "__none__" 값 제외
    const requiredMapped = fieldMappings.required.every(
      (field) =>
        columnMapping[field.key] && columnMapping[field.key] !== '__none__'
    );

    if (!requiredMapped) {
      showAlert('필수 필드 누락', '필수 필드(이름, 전화번호)를 매핑해주세요.');
      return;
    }

    // 데이터 검증 시뮬레이션
    const validationResults = generateValidationResults(previewData);
    setValidationResults(validationResults);
    setCurrentStep('preview');
  };

  // 임포트 완료 핸들러
  const handleImportComplete = () => {
    // 완료 단계로 바로 이동 (외부 콜백 제거)
    setCurrentStep('complete');
  };

  // 모달 리셋 및 닫기
  const handleClose = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setPreviewData([]);
    setColumnMapping({});
    setValidationResults([]);
    setUploadProgress(0);
    setIsDragOver(false);
    setAlertModal({ open: false, title: '', message: '' });
    onOpenChange(false);
  };

  // 새 임포트 시작
  const handleNewImport = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setPreviewData([]);
    setColumnMapping({});
    setValidationResults([]);
    setUploadProgress(0);
    setIsDragOver(false);
    setAlertModal({ open: false, title: '', message: '' });
  };

  // 템플릿 다운로드 (더미)
  const handleDownloadTemplate = () => {
    const csvContent =
      '이름,전화번호,이메일,회사명,직책,주소,메모\n김영희,010-1234-5678,kim@example.com,ABC 회사,팀장,서울시 강남구,VIP 고객';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '고객_임포트_템플릿.csv';
    link.click();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[85vh] overflow-hidden">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-xl font-semibold">
              고객 데이터 가져오기
            </DialogTitle>
            <DialogDescription className="text-sm">
              엑셀, CSV 파일로 여러 고객을 한번에 추가하세요
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={currentStep}
            className="w-full h-[calc(85vh-120px)] flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" disabled={currentStep !== 'upload'}>
                1. 파일 업로드
              </TabsTrigger>
              <TabsTrigger value="mapping" disabled={currentStep === 'upload'}>
                2. 필드 매핑
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                disabled={!['preview', 'complete'].includes(currentStep)}
              >
                3. 미리보기
              </TabsTrigger>
              <TabsTrigger
                value="complete"
                disabled={currentStep !== 'complete'}
              >
                4. 완료
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              {/* 1. 파일 업로드 */}
              <TabsContent
                value="upload"
                className="flex-1 overflow-y-auto space-y-6 mt-4"
              >
                <div className="space-y-6">
                  {/* 지원 형식 안내 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                      <FileTextIcon className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-semibold">CSV 파일</div>
                        <div className="text-sm text-muted-foreground">
                          쉼표로 구분된 값 (.csv)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                      <FileTextIcon className="h-8 w-8 text-secondary-foreground" />
                      <div>
                        <div className="font-semibold">Excel 파일</div>
                        <div className="text-sm text-muted-foreground">
                          .xlsx, .xls 형식
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 파일 업로드 영역 */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                      isDragOver
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : isUploading
                        ? 'border-muted-foreground/25 bg-muted/20'
                        : selectedFile
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="space-y-4">
                        <UploadIcon className="h-16 w-16 text-primary mx-auto animate-pulse" />
                        <div>
                          <div className="text-lg font-semibold">
                            파일 분석 중...
                          </div>
                          <Progress
                            value={uploadProgress}
                            className="mt-4 max-w-md mx-auto h-2"
                          />
                          <div className="text-sm text-muted-foreground mt-2">
                            {uploadProgress}% 완료 - 데이터 구조 분석 중
                          </div>
                        </div>
                      </div>
                    ) : selectedFile ? (
                      <div className="space-y-4">
                        <CheckIcon className="h-16 w-16 text-primary mx-auto" />
                        <div>
                          <div className="text-lg font-semibold text-primary">
                            {selectedFile.name}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{' '}
                            {previewData.length}개 행 감지
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setPreviewData([]);
                            setDetectedColumns([]);
                          }}
                          variant="outline"
                        >
                          다른 파일 선택
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <UploadIcon className="h-16 w-16 text-muted-foreground mx-auto" />
                        <div>
                          <div className="text-lg font-semibold">
                            파일을 드래그 앤 드롭하거나 클릭하여 업로드
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            최대 10MB, CSV/Excel 파일만 지원합니다
                          </div>
                        </div>
                        <Button>파일 선택</Button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {/* 템플릿 다운로드 */}
                  <div className="p-6 bg-muted/40 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileTextIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            템플릿 파일이 필요하신가요?
                          </div>
                          <div className="text-sm text-muted-foreground">
                            권장 형식의 템플릿을 다운로드하여 사용하세요
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        className="shrink-0"
                      >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        템플릿 다운로드
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 2. 필드 매핑 */}
              <TabsContent
                value="mapping"
                className="flex-1 overflow-y-auto space-y-6 mt-4"
              >
                <div className="space-y-6">
                  {/* 데이터 미리보기 */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      데이터 미리보기
                    </h3>
                    <div className="border rounded-lg overflow-hidden bg-muted/20">
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-full">
                          <div className="bg-muted/50 px-3 py-2 border-b">
                            <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                              {detectedColumns.slice(0, 4).map((col, index) => (
                                <div
                                  key={index}
                                  className="truncate"
                                  title={col}
                                >
                                  {col}
                                </div>
                              ))}
                            </div>
                            {detectedColumns.length > 4 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                +{detectedColumns.length - 4}개 컬럼 더 있음
                              </div>
                            )}
                          </div>
                          <div className="divide-y">
                            {previewData.slice(0, 5).map((row, rowIndex) => (
                              <div key={rowIndex} className="px-3 py-2">
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                  {row
                                    .slice(0, 4)
                                    .map((cell: string, cellIndex: number) => (
                                      <div
                                        key={cellIndex}
                                        className="truncate"
                                        title={cell}
                                      >
                                        {cell}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      처음 5개 행과 4개 컬럼만 표시됩니다. 총{' '}
                      {previewData.length}개 행, {detectedColumns.length}개
                      컬럼이 감지되었습니다.
                    </p>
                  </div>

                  {/* 필드 매핑 */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">필드 매핑</h3>

                    {/* 필수 필드 */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-destructive rounded-full"></span>
                          필수 필드
                        </h4>
                        <div className="space-y-2">
                          {fieldMappings.required.map((field) => (
                            <div
                              key={field.key}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 border rounded bg-destructive/5 border-destructive/20"
                            >
                              <div className="flex items-center gap-2 min-w-0 sm:w-1/4">
                                <span className="font-medium text-sm">
                                  {field.label}
                                </span>
                                <Badge
                                  variant="destructive"
                                  className="text-xs px-1 py-0.5 flex-shrink-0"
                                >
                                  필수
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <Select
                                  value={columnMapping[field.key] || ''}
                                  onValueChange={(value) =>
                                    setColumnMapping((prev) => ({
                                      ...prev,
                                      [field.key]:
                                        value === '__none__' ? '' : value,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="cursor-pointer w-full h-8">
                                    <SelectValue placeholder="컬럼 선택" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value="__none__"
                                      className="cursor-pointer"
                                    >
                                      선택 안함
                                    </SelectItem>
                                    {detectedColumns.map((col) => (
                                      <SelectItem
                                        key={col}
                                        value={col}
                                        className="cursor-pointer"
                                      >
                                        {col}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 선택 필드 */}
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                          선택 필드
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {fieldMappings.optional.map((field) => (
                            <div
                              key={field.key}
                              className="flex flex-col gap-1 p-2 border rounded bg-muted/20"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">
                                  {field.label}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1 py-0.5 flex-shrink-0"
                                >
                                  선택
                                </Badge>
                              </div>
                              <Select
                                value={columnMapping[field.key] || ''}
                                onValueChange={(value) =>
                                  setColumnMapping((prev) => ({
                                    ...prev,
                                    [field.key]:
                                      value === '__none__' ? '' : value,
                                  }))
                                }
                              >
                                <SelectTrigger className="cursor-pointer w-full h-8">
                                  <SelectValue placeholder="컬럼 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value="__none__"
                                    className="cursor-pointer"
                                  >
                                    선택 안함
                                  </SelectItem>
                                  {detectedColumns.map((col) => (
                                    <SelectItem
                                      key={col}
                                      value={col}
                                      className="cursor-pointer"
                                    >
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

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('upload')}
                    >
                      이전
                    </Button>
                    <Button onClick={handleMappingComplete}>
                      다음: 데이터 검증
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* 3. 미리보기 및 검증 */}
              <TabsContent
                value="preview"
                className="flex-1 overflow-y-auto space-y-6 mt-4"
              >
                <div className="space-y-6">
                  {/* 검증 결과 요약 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center bg-card border-border">
                      <div className="text-2xl font-bold text-primary">
                        {previewData.length -
                          validationResults.filter(
                            (r) => r.severity === 'error'
                          ).length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        정상 데이터
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg text-center bg-card border-border">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {
                          validationResults.filter(
                            (r) => r.severity === 'warning'
                          ).length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">경고</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center bg-card border-border">
                      <div className="text-2xl font-bold text-destructive">
                        {
                          validationResults.filter(
                            (r) => r.severity === 'error'
                          ).length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">오류</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center bg-card border-border">
                      <div className="text-2xl font-bold text-muted-foreground">
                        0
                      </div>
                      <div className="text-sm text-muted-foreground">중복</div>
                    </div>
                  </div>

                  {/* 문제가 있는 데이터 */}
                  {validationResults.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">
                        수정 필요한 데이터
                      </h3>
                      <div className="space-y-3">
                        {validationResults.map((result, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 bg-muted/30"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    variant={
                                      result.severity === 'error'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                    {result.issue}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    행 {result.row} • {result.field}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">
                                      현재값:
                                    </span>
                                    <div className="font-mono bg-muted/50 p-2 rounded mt-1 truncate">
                                      {result.data || '(빈 값)'}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      제안:
                                    </span>
                                    <div className="bg-primary/10 text-primary p-2 rounded mt-1 truncate">
                                      {result.suggestion}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs px-3 py-1"
                                >
                                  수정
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs px-3 py-1"
                                >
                                  건너뛰기
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('mapping')}
                    >
                      이전
                    </Button>
                    <Button onClick={handleImportComplete}>
                      {validationResults.filter((r) => r.severity === 'error')
                        .length > 0
                        ? '오류 제외하고 임포트'
                        : '임포트 실행'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* 4. 완료 */}
              <TabsContent
                value="complete"
                className="flex-1 overflow-y-auto space-y-6 mt-4"
              >
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckIcon className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-primary">
                      임포트 완료!
                    </h3>
                    <p className="text-muted-foreground text-lg mt-3">
                      {previewData.length -
                        validationResults.filter((r) => r.severity === 'error')
                          .length}
                      명의 고객이 성공적으로 추가되었습니다
                    </p>
                    {validationResults.filter((r) => r.severity === 'error')
                      .length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {
                          validationResults.filter(
                            (r) => r.severity === 'error'
                          ).length
                        }
                        개의 오류가 있어 건너뛰어졌습니다
                      </p>
                    )}
                  </div>

                  {/* 임포트 통계 */}
                  <div className="max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg bg-card">
                        <div className="text-lg font-bold text-primary">
                          {previewData.length -
                            validationResults.filter(
                              (r) => r.severity === 'error'
                            ).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          성공
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg bg-card">
                        <div className="text-lg font-bold text-destructive">
                          {
                            validationResults.filter(
                              (r) => r.severity === 'error'
                            ).length
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          실패
                        </div>
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="mt-4 p-3 border rounded-lg bg-muted/30">
                        <div className="text-sm font-medium">
                          {selectedFile.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          총 {previewData.length}개 행 처리 완료
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button onClick={handleClose}>고객 목록 보기</Button>
                    <Button variant="outline" onClick={handleNewImport}>
                      새 임포트 시작
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 알림 모달 */}
      <Dialog
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {alertModal.title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {alertModal.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() =>
                setAlertModal({ open: false, title: '', message: '' })
              }
              className="px-6"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
