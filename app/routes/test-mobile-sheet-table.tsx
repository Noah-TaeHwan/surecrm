import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Input } from '~/common/components/ui/input';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Star,
  ChevronDown,
  Users,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import {
  MobileSheet,
  MobileSheetTrigger,
  MobileSheetContent,
  MobileSheetHeader,
  MobileSheetTitle,
  MobileSheetDescription,
  MobileSheetFooter,
  MobileSheetClose,
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell,
  ResponsiveTableHead,
  ResponsiveTableFooter,
  ResponsiveTableCaption,
} from '~/common/components/responsive';

export function meta() {
  return [
    { title: 'Mobile Sheet & Table Test - SureCRM' },
    { name: 'description', content: 'Testing mobile-optimized sheet and table components' }
  ];
}

// Mock data for testing
const sampleClients = [
  {
    id: 1,
    name: '김민수',
    phone: '010-1234-5678',
    email: 'kim.minsu@email.com',
    status: '활성',
    premium: 120000,
    lastContact: '2025-01-15',
    rating: 5,
  },
  {
    id: 2,
    name: '이영희',
    phone: '010-9876-5432',
    email: 'lee.younghee@email.com',
    status: '대기',
    premium: 95000,
    lastContact: '2025-01-12',
    rating: 4,
  },
  {
    id: 3,
    name: '박철수',
    phone: '010-5555-1234',
    email: 'park.chulsoo@email.com',
    status: '비활성',
    premium: 150000,
    lastContact: '2025-01-10',
    rating: 3,
  },
  {
    id: 4,
    name: '정수진',
    phone: '010-7777-8888',
    email: 'jung.sujin@email.com',
    status: '활성',
    premium: 85000,
    lastContact: '2025-01-16',
    rating: 5,
  },
  {
    id: 5,
    name: '최현우',
    phone: '010-3333-4444',
    email: 'choi.hyunwoo@email.com',
    status: '활성',
    premium: 200000,
    lastContact: '2025-01-14',
    rating: 4,
  },
];

export default function TestMobileSheetTable() {
  const [selectedClient, setSelectedClient] = useState<typeof sampleClients[0] | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const addToLog = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog(prev => [`[${timestamp}] ${action}`, ...prev.slice(0, 9)]);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      '활성': 'bg-green-100 text-green-800',
      '대기': 'bg-yellow-100 text-yellow-800',
      '비활성': 'bg-gray-100 text-gray-800',
    } as const;
    
    return variants[status as keyof typeof variants] || variants['대기'];
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}원`;
  };

  const filteredClients = sampleClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                모바일 Sheet & Table 테스트
              </h1>
              <p className="text-gray-600 mt-1">
                반응형 컴포넌트들의 모바일 최적화 기능을 테스트합니다
              </p>
            </div>
            
            <div className="flex gap-2">
              <MobileSheet>
                <MobileSheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addToLog('필터 시트 열기')}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    필터
                  </Button>
                </MobileSheetTrigger>
                <MobileSheetContent side="bottom" size="large">
                  <MobileSheetHeader>
                    <MobileSheetTitle>고객 필터링</MobileSheetTitle>
                    <MobileSheetDescription>
                      원하는 조건으로 고객 목록을 필터링하세요
                    </MobileSheetDescription>
                  </MobileSheetHeader>
                  
                  <div className="py-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        검색어
                      </label>
                      <Input
                        type="text"
                        placeholder="이름 또는 이메일로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        상태
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['활성', '대기', '비활성'].map((status) => (
                          <Button
                            key={status}
                            variant="outline"
                            size="sm"
                            className="justify-center"
                            onClick={() => addToLog(`${status} 필터 적용`)}
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        보험료 범위
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="최소 금액" />
                        <Input type="number" placeholder="최대 금액" />
                      </div>
                    </div>
                  </div>
                  
                  <MobileSheetFooter>
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => addToLog('필터 초기화')}
                      >
                        초기화
                      </Button>
                      <MobileSheetClose asChild>
                        <Button className="flex-1" onClick={() => addToLog('필터 적용')}>
                          적용하기
                        </Button>
                      </MobileSheetClose>
                    </div>
                  </MobileSheetFooter>
                </MobileSheetContent>
              </MobileSheet>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => addToLog('데이터 내보내기')}
              >
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: '총 고객', value: filteredClients.length, color: 'blue' },
            { icon: TrendingUp, label: '활성 고객', value: filteredClients.filter(c => c.status === '활성').length, color: 'green' },
            { icon: DollarSign, label: '평균 보험료', value: formatCurrency(Math.round(filteredClients.reduce((sum, c) => sum + c.premium, 0) / filteredClients.length)), color: 'purple' },
            { icon: Star, label: '평균 평점', value: (filteredClients.reduce((sum, c) => sum + c.rating, 0) / filteredClients.length).toFixed(1), color: 'yellow' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Responsive Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">고객 목록</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    addToLog(`이름순 정렬 (${sortDirection === 'asc' ? '내림차순' : '오름차순'})`);
                  }}
                >
                  정렬 <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          <ResponsiveTable
            mobileMode="cards"
            mobileDensity="comfortable"
            mobileInteraction="tap"
            onMobileRowClick={(index, data) => {
              setSelectedClient(filteredClients[index]);
              addToLog(`고객 선택: ${filteredClients[index]?.name}`);
            }}
            mobileHapticFeedback={true}
            className="w-full"
          >
            <ResponsiveTableCaption>
              총 {filteredClients.length}명의 고객
            </ResponsiveTableCaption>
            
            <ResponsiveTableHeader
              mobileSortable={true}
              mobileSortDirection={sortDirection}
              onMobileSort={() => {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                addToLog('모바일 정렬 실행');
              }}
            >
              <ResponsiveTableRow>
                <ResponsiveTableHead>이름</ResponsiveTableHead>
                <ResponsiveTableHead>연락처</ResponsiveTableHead>
                <ResponsiveTableHead>상태</ResponsiveTableHead>
                <ResponsiveTableHead>보험료</ResponsiveTableHead>
                <ResponsiveTableHead>평점</ResponsiveTableHead>
                <ResponsiveTableHead>작업</ResponsiveTableHead>
              </ResponsiveTableRow>
            </ResponsiveTableHeader>

            <ResponsiveTableBody>
              {filteredClients.map((client, index) => (
                <ResponsiveTableRow 
                  key={client.id}
                  mobileIndex={index}
                  mobileData={client}
                  mobileIsSelected={selectedClient?.id === client.id}
                >
                  <ResponsiveTableCell 
                    mobileLabel="이름" 
                    mobilePrimary={true}
                  >
                    <div className="font-medium text-gray-900">
                      {client.name}
                    </div>
                    <div className="text-sm text-gray-500 sm:hidden">
                      {client.email}
                    </div>
                  </ResponsiveTableCell>
                  
                  <ResponsiveTableCell 
                    mobileLabel="연락처"
                    className="hidden sm:table-cell"
                  >
                    <div>{client.phone}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </ResponsiveTableCell>
                  
                  <ResponsiveTableCell mobileLabel="상태">
                    <Badge className={getStatusBadge(client.status)}>
                      {client.status}
                    </Badge>
                  </ResponsiveTableCell>
                  
                  <ResponsiveTableCell 
                    mobileLabel="보험료"
                    mobileNumeric={true}
                  >
                    <span className="font-mono">
                      {formatCurrency(client.premium)}
                    </span>
                  </ResponsiveTableCell>
                  
                  <ResponsiveTableCell mobileLabel="평점">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{client.rating}</span>
                    </div>
                  </ResponsiveTableCell>
                  
                  <ResponsiveTableCell mobileLabel="작업">
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToLog(`${client.name} 편집`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToLog(`${client.name} 더보기`);
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </ResponsiveTableCell>
                </ResponsiveTableRow>
              ))}
            </ResponsiveTableBody>

            <ResponsiveTableFooter mobileSticky={true}>
              <ResponsiveTableRow>
                <ResponsiveTableCell colSpan={6}>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>총 {filteredClients.length}개 항목</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">이전</Button>
                      <Button variant="outline" size="sm">다음</Button>
                    </div>
                  </div>
                </ResponsiveTableCell>
              </ResponsiveTableRow>
            </ResponsiveTableFooter>
          </ResponsiveTable>
        </div>

        {/* Selected Client Detail Sheet */}
        {selectedClient && (
          <MobileSheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
            <MobileSheetContent side="right" size="large">
              <MobileSheetHeader>
                <MobileSheetTitle>{selectedClient.name} 상세 정보</MobileSheetTitle>
                <MobileSheetDescription>
                  고객의 자세한 정보를 확인하고 편집할 수 있습니다
                </MobileSheetDescription>
              </MobileSheetHeader>
              
              <div className="py-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름
                    </label>
                    <Input value={selectedClient.name} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호
                    </label>
                    <Input value={selectedClient.phone} readOnly />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <Input value={selectedClient.email} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상태
                    </label>
                    <Badge className={getStatusBadge(selectedClient.status)}>
                      {selectedClient.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      월 보험료
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(selectedClient.premium)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      평점
                    </label>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < selectedClient.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({selectedClient.rating}/5)
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      마지막 연락
                    </label>
                    <div className="text-sm text-gray-600">
                      {selectedClient.lastContact}
                    </div>
                  </div>
                </div>
              </div>
              
              <MobileSheetFooter>
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => addToLog(`${selectedClient.name} 편집 모드`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => addToLog(`${selectedClient.name} 삭제 시도`)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                </div>
              </MobileSheetFooter>
            </MobileSheetContent>
          </MobileSheet>
        )}

        {/* Action Log */}
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
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => {
              setActionLog([]);
              addToLog('로그 초기화');
            }}
          >
            로그 지우기
          </Button>
        </div>

        {/* Component Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">컴포넌트 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">MobileSheet 기능</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 4방향 슬라이드 (top, bottom, left, right)</li>
                <li>• 4가지 크기 (compact, default, large, full)</li>
                <li>• 스와이프 제스처 지원</li>
                <li>• 햅틱 피드백 (20ms/30ms/50ms)</li>
                <li>• 드래그 핸들 UI</li>
                <li>• Safe Area 지원</li>
                <li>• WCAG 2.5.5 AAA 준수</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">ResponsiveTable 기능</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 3가지 모바일 모드 (cards, stacked, horizontal)</li>
                <li>• 3가지 밀도 (compact, comfortable, spacious)</li>
                <li>• 터치 인터랙션 (tap, swipe, long-press)</li>
                <li>• 자동 데스크톱/모바일 전환</li>
                <li>• 정렬 및 필터링 지원</li>
                <li>• 가상 스크롤링 지원</li>
                <li>• 완전한 접근성 지원</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 