import { useState } from 'react';
import { Button } from '~/common/components/ui/button';

export function meta() {
  return [
    { title: 'Mobile Sheet & Table Test - SureCRM' },
    { name: 'description', content: 'Testing mobile sheet and table components' }
  ];
}

export default function TestSheetTable() {
  const [actionLog, setActionLog] = useState<string[]>([]);

  const addToLog = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog(prev => [`[${timestamp}] ${action}`, ...prev.slice(0, 9)]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            모바일 Sheet & Table 테스트
          </h1>
          <p className="text-gray-600">
            반응형 컴포넌트들의 모바일 최적화 기능을 테스트합니다
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">기본 테스트</h2>
          <div className="space-y-3">
            <Button onClick={() => addToLog('테스트 실행')}>
              테스트 시작
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">액션 로그</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {actionLog.length === 0 ? (
              <p className="text-gray-500 text-sm">아직 액션이 없습니다.</p>
            ) : (
              actionLog.map((log, index) => (
                <div 
                  key={index}
                  className="text-sm text-gray-600 font-mono bg-gray-50 rounded px-3 py-2"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 