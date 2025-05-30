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
import { PlusIcon, UpdateIcon } from '@radix-ui/react-icons';
import { formOptions } from '../lib/form-schema';

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function AddClientModal({
  open,
  onOpenChange,
  onSubmit,
}: AddClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    telecomProvider: '',
    address: '',
    occupation: '',
    height: '',
    weight: '',
    hasDrivingLicense: '',
    stage: '첫 상담',
    importance: 'medium',
    referredBy: '',
    tags: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert('이름과 전화번호는 필수 항목입니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 데이터 변환
      const submitData = {
        ...formData,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        hasDrivingLicense:
          formData.hasDrivingLicense === 'true'
            ? true
            : formData.hasDrivingLicense === 'false'
            ? false
            : undefined,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      await onSubmit(submitData);

      // 폼 리셋
      setFormData({
        name: '',
        phone: '',
        email: '',
        telecomProvider: '',
        address: '',
        occupation: '',
        height: '',
        weight: '',
        hasDrivingLicense: '',
        stage: '첫 상담',
        importance: 'medium',
        referredBy: '',
        tags: '',
        notes: '',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('고객 추가 실패:', error);
      alert('고객 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />새 고객 추가
          </DialogTitle>
          <DialogDescription>
            새로운 고객의 기본 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기본 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">이름 *</label>
                <Input
                  placeholder="고객 이름"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">전화번호 *</label>
                <Input
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">이메일</label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">통신사</label>
                <Select
                  value={formData.telecomProvider}
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
              <label className="text-sm font-medium">주소</label>
              <Input
                placeholder="상세 주소"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">직업</label>
              <Input
                placeholder="직업 (상세)"
                value={formData.occupation}
                onChange={(e) =>
                  handleInputChange('occupation', e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">키 (cm)</label>
                <Input
                  type="number"
                  placeholder="165"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">몸무게 (kg)</label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">운전 여부</label>
                <Select
                  value={formData.hasDrivingLicense}
                  onValueChange={(value) =>
                    handleInputChange('hasDrivingLicense', value)
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">영업 단계</label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => handleInputChange('stage', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.stages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">중요도</label>
                <Select
                  value={formData.importance}
                  onValueChange={(value) =>
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">소개자</label>
              <Input
                placeholder="소개자 이름 (선택사항)"
                value={formData.referredBy}
                onChange={(e) =>
                  handleInputChange('referredBy', e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">태그</label>
              <Input
                placeholder="태그를 쉼표로 구분하여 입력 (예: VIP, 기업, 잠재)"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">메모</label>
              <Textarea
                placeholder="고객에 대한 메모사항"
                className="resize-none"
                rows={3}
                value={formData.notes}
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
