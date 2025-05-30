import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Label } from '~/common/components/ui/label';
import { Badge } from '~/common/components/ui/badge';
import { Switch } from '~/common/components/ui/switch';
import {
  PlusIcon,
  UpdateIcon,
  LockClosedIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import type {
  ClientDisplay,
  ClientPrivacyLevel,
} from '~/features/clients/types';
import { formOptions } from '../lib/form-schema';
import { logDataAccess } from '../lib/client-data';

// 🔧 고객 생성 데이터 타입
interface CreateClientData {
  fullName: string;
  phone: string;
  email?: string;
  telecomProvider?: string;
  address?: string;
  occupation?: string;
  height?: number;
  weight?: number;
  hasDrivingLicense?: boolean;
  importance: 'high' | 'medium' | 'low';
  referredById?: string;
  tags: string[];
  notes?: string;
  // 🔒 보안 관련 필드
  privacyLevel: ClientPrivacyLevel;
  hasConfidentialData: boolean;
  dataConsents: {
    marketing: boolean;
    dataProcessing: boolean;
    thirdPartyShare: boolean;
  };
}

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateClientData) => Promise<void>;
  agentId: string; // 🔒 보안 로깅용
}

export function AddClientModal({
  open,
  onOpenChange,
  onSubmit,
  agentId,
}: AddClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateClientData>({
    fullName: '',
    phone: '',
    email: '',
    telecomProvider: '',
    address: '',
    occupation: '',
    height: undefined,
    weight: undefined,
    hasDrivingLicense: undefined,
    importance: 'medium',
    referredById: '',
    tags: [],
    notes: '',
    // 🔒 기본 보안 설정
    privacyLevel: 'private',
    hasConfidentialData: false,
    dataConsents: {
      marketing: false,
      dataProcessing: true, // 필수 동의
      thirdPartyShare: false,
    },
  });

  // 🔒 개인정보 보호 레벨 옵션
  const privacyLevelOptions: {
    value: ClientPrivacyLevel;
    label: string;
    description: string;
  }[] = [
    { value: 'public', label: '공개', description: '일반적인 고객 정보' },
    {
      value: 'restricted',
      label: '제한',
      description: '민감하지 않은 개인정보',
    },
    { value: 'private', label: '비공개', description: '개인정보 (기본값)' },
    { value: 'confidential', label: '기밀', description: '매우 민감한 정보' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 필수 필드 및 데이터 처리 동의 확인
    if (!formData.fullName || !formData.phone) {
      alert('이름과 전화번호는 필수 항목입니다.');
      return;
    }

    if (!formData.dataConsents.dataProcessing) {
      alert('데이터 처리 동의는 필수입니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 🔒 데이터 생성 로깅
      await logDataAccess(
        'new-client',
        agentId,
        'edit',
        ['fullName', 'phone', 'email'],
        undefined,
        navigator.userAgent,
        '새 고객 추가'
      );

      await onSubmit(formData);

      // 폼 리셋
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        telecomProvider: '',
        address: '',
        occupation: '',
        height: undefined,
        weight: undefined,
        hasDrivingLicense: undefined,
        importance: 'medium',
        referredById: '',
        tags: [],
        notes: '',
        privacyLevel: 'private',
        hasConfidentialData: false,
        dataConsents: {
          marketing: false,
          dataProcessing: true,
          thirdPartyShare: false,
        },
      });

      onOpenChange(false);
    } catch (error) {
      console.error('고객 추가 실패:', error);
      alert('고객 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateClientData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConsentChange = (
    field: keyof CreateClientData['dataConsents'],
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      dataConsents: {
        ...prev.dataConsents,
        [field]: value,
      },
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    handleInputChange('tags', tags);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />새 고객 추가
          </DialogTitle>
          <DialogDescription>
            새로운 고객의 정보를 안전하게 입력해주세요. 개인정보 보호 정책에
            따라 관리됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 🔒 개인정보 보호 설정 */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <LockClosedIcon className="h-4 w-4" />
              <h3 className="text-lg font-medium">개인정보 보호 설정</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>개인정보 보호 레벨</Label>
                <Select
                  value={formData.privacyLevel}
                  onValueChange={(value: ClientPrivacyLevel) =>
                    handleInputChange('privacyLevel', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {privacyLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>민감정보 포함</Label>
                  <Switch
                    checked={formData.hasConfidentialData}
                    onCheckedChange={(checked) =>
                      handleInputChange('hasConfidentialData', checked)
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  건강정보, 재정정보 등 민감한 개인정보 포함 여부
                </p>
              </div>
            </div>

            {/* 데이터 처리 동의 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">데이터 처리 동의</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">데이터 처리 동의 (필수)</Label>
                  <Switch
                    checked={formData.dataConsents.dataProcessing}
                    onCheckedChange={(checked) =>
                      handleConsentChange('dataProcessing', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">마케팅 활용 동의</Label>
                  <Switch
                    checked={formData.dataConsents.marketing}
                    onCheckedChange={(checked) =>
                      handleConsentChange('marketing', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">제3자 제공 동의</Label>
                  <Switch
                    checked={formData.dataConsents.thirdPartyShare}
                    onCheckedChange={(checked) =>
                      handleConsentChange('thirdPartyShare', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 기본 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기본 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>이름 *</Label>
                <Input
                  placeholder="고객 이름"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange('fullName', e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>전화번호 *</Label>
                <Input
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>이메일</Label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>통신사</Label>
                <Select
                  value={formData.telecomProvider || ''}
                  onValueChange={(value) =>
                    handleInputChange('telecomProvider', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="통신사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.telecomProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>주소</Label>
              <Input
                placeholder="상세 주소"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>직업</Label>
              <Input
                placeholder="직업 (상세)"
                value={formData.occupation || ''}
                onChange={(e) =>
                  handleInputChange('occupation', e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>키 (cm)</Label>
                <Input
                  type="number"
                  placeholder="165"
                  value={formData.height?.toString() || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'height',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>몸무게 (kg)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formData.weight?.toString() || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'weight',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>운전 여부</Label>
                <Select
                  value={
                    formData.hasDrivingLicense === true
                      ? 'true'
                      : formData.hasDrivingLicense === false
                      ? 'false'
                      : ''
                  }
                  onValueChange={(value) =>
                    handleInputChange(
                      'hasDrivingLicense',
                      value === 'true'
                        ? true
                        : value === 'false'
                        ? false
                        : undefined
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">운전 가능</SelectItem>
                    <SelectItem value="false">운전 불가</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 영업 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">영업 정보</h3>

            <div className="space-y-2">
              <Label>중요도</Label>
              <Select
                value={formData.importance}
                onValueChange={(value: 'high' | 'medium' | 'low') =>
                  handleInputChange('importance', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">높음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>소개자 ID</Label>
              <Input
                placeholder="소개자 ID (선택사항)"
                value={formData.referredById || ''}
                onChange={(e) =>
                  handleInputChange('referredById', e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>태그</Label>
              <Input
                placeholder="태그를 쉼표로 구분하여 입력 (예: VIP, 기업, 잠재)"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>메모</Label>
              <Textarea
                placeholder="고객에 대한 메모사항"
                className="resize-none"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                  추가 중...
                </>
              ) : (
                <>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  고객 추가
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
