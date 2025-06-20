import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';

interface PasswordSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordSuccessModal({ isOpen, onClose }: PasswordSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          {/* 성공 아이콘과 애니메이션 */}
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center relative">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 animate-pulse" />
            
            {/* 반짝임 효과 */}
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-6 h-6 text-green-500 dark:text-green-300 animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -left-1">
              <Sparkles className="w-4 h-4 text-green-400 dark:text-green-300 animate-bounce delay-200" />
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            🎉 비밀번호 변경 완료!
          </DialogTitle>
          
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-center">
            <span className="block text-base mb-2">
              새로운 비밀번호가 성공적으로 설정되었습니다.
            </span>
            <span className="block text-sm">
              이제 새로운 비밀번호로 SureCRM에 로그인하실 수 있습니다.
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* 구분선 */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-6" />

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <Button asChild className="w-full h-12 text-base font-medium group">
            <Link to="/auth/login">
              <span className="flex items-center gap-2">
                로그인하러 가기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            나중에 로그인하기
          </Button>
        </div>

        {/* 추가 정보 */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-700 dark:text-blue-300 text-center">
            💡 <strong>보안 팁:</strong> 새로운 비밀번호는 안전하게 보관해주세요
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 