import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Textarea } from '~/common/components/ui/textarea';
import type { PipelineStage } from '../pages/+types/pipeline-page';

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: PipelineStage[];
  referrers: { id: string; name: string }[];
  initialStageId?: string;
  onAddClient: (client: {
    name: string;
    phone: string;
    email?: string;
    stageId: string;
    importance: 'high' | 'medium' | 'low';
    referrerId?: string;
    note?: string;
  }) => void;
}

export function AddClientModal({
  open,
  onOpenChange,
  stages,
  referrers,
  initialStageId = '',
  onAddClient,
}: AddClientModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [stageId, setStageId] = useState(initialStageId || stages[0]?.id || '');
  const [importance, setImportance] = useState<'high' | 'medium' | 'low'>(
    'medium'
  );
  const [referrerId, setReferrerId] = useState<string | undefined>(undefined);
  const [note, setNote] = useState('');

  // 초기 단계 ID가 변경되면 업데이트
  useEffect(() => {
    if (initialStageId) {
      setStageId(initialStageId);
    }
  }, [initialStageId]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setStageId(initialStageId || stages[0]?.id || '');
    setImportance('medium');
    setReferrerId(undefined);
    setNote('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddClient({
      name,
      phone,
      email: email || undefined,
      stageId,
      importance,
      referrerId,
      note: note || undefined,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 고객 추가</DialogTitle>
          <DialogDescription>
            고객 정보를 입력하여 파이프라인에 추가하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">고객명 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호 *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">진행 단계 *</Label>
              <Select value={stageId} onValueChange={setStageId} required>
                <SelectTrigger>
                  <SelectValue placeholder="단계 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>영업 단계</SelectLabel>
                    {stages.map((stage) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={stage.id}
                        value={stage.id}
                      >
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="importance">중요도 *</Label>
              <Select
                value={importance}
                onValueChange={(val) =>
                  setImportance(val as 'high' | 'medium' | 'low')
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="중요도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>중요도</SelectLabel>
                    <SelectItem className="cursor-pointer" value="high">
                      높음
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="medium">
                      중간
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="low">
                      낮음
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referrer">소개자</Label>
            <Select value={referrerId} onValueChange={setReferrerId}>
              <SelectTrigger>
                <SelectValue placeholder="소개자 선택 (선택사항)" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>소개자</SelectLabel>
                  {referrers.map((referrer) => (
                    <SelectItem
                      className="cursor-pointer"
                      key={referrer.id}
                      value={referrer.id}
                    >
                      {referrer.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">메모</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="고객에 대한 메모를 입력하세요"
              className="resize-none"
              rows={3}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              취소
            </Button>
            <Button type="submit">추가</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
