import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/common/components/ui/dialog';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/common/components/ui/select';
import { Textarea } from '~/common/components/ui/textarea';

export function meta() {
  return [
    { title: '모바일 줌인 방지 테스트 - SureCRM' },
    { name: 'description', content: '모바일 디바이스에서 모달 내 input 포커스 시 줌인 방지 테스트' },
  ];
}

export default function TestMobileZoom() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            모바일 줌인 방지 테스트
          </h1>
          <p className="text-gray-600">
            모바일/태블릿에서 모달 내 input 포커스 시 줌인이 발생하지 않는지 테스트합니다.
          </p>
        </div>

        {/* 테스트 설명 */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-3">
            테스트 방법
          </h2>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• 모바일 디바이스(iPhone, iPad, Android)에서 이 페이지를 열어주세요</li>
            <li>• 아래 "모달 열기" 버튼을 눌러 모달을 여세요</li>
            <li>• 모달 내의 각 input 필드를 터치해서 포커스해보세요</li>
            <li>• iOS Safari에서 줌인이 발생하지 않아야 합니다</li>
            <li>• 텍스트 입력이 정상적으로 되어야 합니다</li>
          </ul>
        </div>

        {/* 일반 페이지 input (비교용) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-3">일반 페이지 Input (비교용)</h3>
          <p className="text-gray-600 text-sm mb-4">
            모달이 아닌 일반 페이지에서는 줌인이 발생하지 않아야 합니다.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="normal-name">이름</Label>
              <Input id="normal-name" placeholder="이름을 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="normal-email">이메일</Label>
              <Input id="normal-email" type="email" placeholder="이메일을 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="normal-select">선택</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="옵션을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">옵션 1</SelectItem>
                  <SelectItem value="option2">옵션 2</SelectItem>
                  <SelectItem value="option3">옵션 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="normal-textarea">메모</Label>
              <Textarea id="normal-textarea" placeholder="메모를 입력하세요" />
            </div>
          </div>
        </div>

        {/* 모달 테스트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-3">모달 Input 테스트</h3>
          <p className="text-gray-600 text-sm mb-4">
            모바일에서 모달 내 input 포커스 시 줌인이 발생하지 않아야 합니다.
          </p>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto">
                모달 열기 - 줌인 방지 테스트
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>모바일 줌인 방지 테스트</DialogTitle>
                <DialogDescription>
                  아래 각 input 필드를 터치해서 줌인이 발생하지 않는지 확인하세요.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-name">이름</Label>
                  <Input 
                    id="modal-name" 
                    placeholder="이름을 입력하세요" 
                    autoComplete="name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modal-email">이메일</Label>
                  <Input 
                    id="modal-email" 
                    type="email" 
                    placeholder="이메일을 입력하세요"
                    autoComplete="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modal-phone">전화번호</Label>
                  <Input 
                    id="modal-phone" 
                    type="tel" 
                    placeholder="010-1234-5678"
                    autoComplete="tel"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modal-number">숫자</Label>
                  <Input 
                    id="modal-number" 
                    type="number" 
                    placeholder="숫자를 입력하세요"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modal-password">비밀번호</Label>
                  <Input 
                    id="modal-password" 
                    type="password" 
                    placeholder="비밀번호를 입력하세요"
                    autoComplete="new-password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modal-date">날짜</Label>
                  <Input 
                    id="modal-date" 
                    type="date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modal-time">시간</Label>
                  <Input 
                    id="modal-time" 
                    type="time"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modal-select">선택 옵션</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="옵션을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">첫 번째 옵션</SelectItem>
                      <SelectItem value="option2">두 번째 옵션</SelectItem>
                      <SelectItem value="option3">세 번째 옵션</SelectItem>
                      <SelectItem value="option4">네 번째 옵션</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modal-textarea">메모</Label>
                  <Textarea 
                    id="modal-textarea" 
                    placeholder="여러 줄 텍스트를 입력하세요..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  취소
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  저장
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 확인 사항 */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3">
            확인 사항
          </h3>
          <ul className="text-green-800 space-y-2 text-sm">
            <li>✅ 모달 내 모든 input 필드에서 줌인이 발생하지 않음</li>
            <li>✅ 텍스트 입력이 정상적으로 작동함</li>
            <li>✅ Select 드롭다운이 정상적으로 열림</li>
            <li>✅ Textarea에서 줄바꿈이 정상적으로 작동함</li>
            <li>✅ 날짜/시간 picker가 정상적으로 열림</li>
          </ul>
        </div>

        {/* 기술적 정보 */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            적용된 해결책
          </h3>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>• Input, Select, Textarea 컴포넌트에 <code className="bg-gray-200 px-1 rounded">font-size: max(16px, 1rem)</code> 적용</li>
            <li>• CSS에서 모달 내 모든 입력 요소에 16px 이상 폰트 사이즈 강제 적용</li>
            <li>• <code className="bg-gray-200 px-1 rounded">-webkit-text-size-adjust: 100%</code>로 iOS Safari 텍스트 크기 조정 방지</li>
            <li>• <code className="bg-gray-200 px-1 rounded">transform-origin: left top</code>으로 줌 시작점 고정</li>
            <li>• Tailwind CSS의 <code className="bg-gray-200 px-1 rounded">sm:text-sm</code> 클래스를 모바일에서 무력화</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 