import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Button } from '~/common/components/ui/button';
import { Progress } from '~/common/components/ui/progress';
import {
  UploadIcon,
  CheckIcon,
  Cross2Icon,
  FileTextIcon,
  ImageIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { documentTypeConfig, insuranceTypeConfig } from './insurance-config';

// 문서 업로드 폼 스키마
const documentSchema = z.object({
  name: z.string().min(1, '문서명을 입력하세요'),
  type: z.string().min(1, '문서 유형을 선택하세요'),
  description: z.string().optional(),
  relatedInsurance: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface AddDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  insuranceTypes?: string[];
  onDocumentAdded?: (document: any) => void;
}

export function AddDocumentModal({
  open,
  onOpenChange,
  clientId,
  clientName,
  insuranceTypes = [],
  onDocumentAdded,
}: AddDocumentModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: '',
      type: '',
      description: '',
      relatedInsurance: 'none',
    },
  });

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);

    // 첫 번째 파일명을 기본 문서명으로 설정
    if (files.length > 0) {
      const fileName = files[0].name.replace(/\.[^/.]+$/, ''); // 확장자 제거
      form.setValue('name', fileName);
    }
  };

  // 파일 제거 핸들러
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);

    if (files.length > 0) {
      const fileName = files[0].name.replace(/\.[^/.]+$/, '');
      form.setValue('name', fileName);
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 아이콘 가져오기
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

    if (imageExtensions.includes(extension || '')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <FileTextIcon className="h-8 w-8 text-gray-500" />;
  };

  // 폼 제출
  const onSubmit = async (data: DocumentFormData) => {
    if (selectedFiles.length === 0) {
      form.setError('name', { message: '파일을 선택해주세요.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 업로드 진행 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const newDocument = {
        id: Date.now().toString(),
        name: data.name,
        type: data.type,
        size: formatFileSize(selectedFiles[0].size),
        uploadDate: new Date().toLocaleDateString('ko-KR'),
        description: data.description,
        relatedInsurance:
          data.relatedInsurance === 'none' ? null : data.relatedInsurance,
        url: `/documents/${Date.now()}`,
        fileName: selectedFiles[0].name,
        clientId,
        createdAt: new Date().toISOString(),
      };

      console.log('새 문서 업로드:', newDocument);
      onDocumentAdded?.(newDocument);

      // 폼 및 상태 초기화
      form.reset();
      setSelectedFiles([]);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error('문서 업로드 실패:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold">
            문서 업로드
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {clientName}님의 문서를 업로드하고 관리하세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* 파일 업로드 영역 */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-foreground">
                파일 선택
              </div>

              {selectedFiles.length === 0 ? (
                <div
                  className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 text-center hover:border-muted-foreground/50 hover:bg-muted/20 transition-all duration-200 cursor-pointer group"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 rounded-full bg-muted group-hover:bg-muted/80 transition-colors">
                      <UploadIcon className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-medium text-foreground">
                        파일을 드래그하여 업로드
                      </div>
                      <div className="text-sm text-muted-foreground">
                        PDF, 이미지, 문서 파일 (최대 10MB)
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      파일 선택
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {getFileIcon(file.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {file.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-dashed"
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      다른 파일 추가
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp"
                    onChange={handleFileSelect}
                  />
                </div>
              )}

              {/* 업로드 진행률 */}
              {isUploading && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground">
                      업로드 중...
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>

            {/* 문서 정보 */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-foreground">
                문서 정보
              </div>

              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        문서명 <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 신분증 사본"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          문서 유형 <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="문서 유형 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(documentTypeConfig).map(
                              ([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    {config.icon}
                                    <span>{config.label}</span>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relatedInsurance"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-sm font-medium text-foreground">
                          관련 보험
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="보험 선택 (선택사항)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">
                                연결 안함
                              </span>
                            </SelectItem>
                            {insuranceTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                <div className="flex items-center gap-2">
                                  {insuranceTypeConfig[type]?.icon}
                                  <span>
                                    {insuranceTypeConfig[type]?.label}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs text-muted-foreground">
                          이 문서가 특정 보험과 관련이 있다면 선택하세요.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        설명
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="문서에 대한 추가 설명을 입력하세요..."
                          className="resize-none min-h-[80px]"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        문서의 내용이나 특이사항을 기록하세요.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-6 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
                className="min-w-[100px]"
              >
                <Cross2Icon className="mr-2 h-4 w-4" />
                취소
              </Button>
              <Button
                type="submit"
                disabled={isUploading || selectedFiles.length === 0}
                className="min-w-[140px]"
              >
                <CheckIcon className="mr-2 h-4 w-4" />
                {isUploading ? '업로드 중...' : '문서 업로드'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
