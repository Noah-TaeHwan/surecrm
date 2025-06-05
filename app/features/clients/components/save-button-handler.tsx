import React from 'react';
import { Button } from '~/common/components/ui/button';

interface SaveButtonProps {
  onSave: () => void;
  label: string;
  className?: string;
}

export function SaveButton({
  onSave,
  label,
  className = 'px-6',
}: SaveButtonProps) {
  return (
    <div className="flex justify-end pb-4 border-b">
      <Button type="submit" className={className} onClick={onSave}>
        {label}
      </Button>
    </div>
  );
}

// 저장 핸들러 생성 유틸리티
export function createSaveHandler({
  intent,
  data,
  successMessage,
  submit,
  setSuccessMessage,
  setShowSuccessModal,
  errorPrefix = '저장 실패',
}: {
  intent: string;
  data: Record<string, any>;
  successMessage: string;
  submit: any;
  setSuccessMessage: (message: string) => void;
  setShowSuccessModal: (show: boolean) => void;
  errorPrefix?: string;
}) {
  return async () => {
    try {
      const formData = new FormData();
      formData.append('intent', intent);

      // 데이터 추가
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      submit(formData, { method: 'post' });

      // 성공 모달 표시
      setSuccessMessage(successMessage);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(`${errorPrefix}:`, error);
    }
  };
}
