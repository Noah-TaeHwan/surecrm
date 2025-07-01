import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/common/components/ui/avatar';
import { Separator } from '~/common/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '~/common/components/ui/sheet';
import {
  useDeviceType,
  useIsTablet,
  useIsTouchDevice,
} from '~/common/hooks/useViewport';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Briefcase,
  Scale,
  Ruler,
  Car,
  Star,
  Tag,
  ChevronLeft,
  ChevronRight,
  Menu,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  MoreVertical,
  FileText,
  Shield,
  Network,
  MessageCircle,
  TrendingUp,
  Settings,
  Clock,
  Award,
  Target,
  CheckCircle,
  ChevronDown,
  X,
  Save,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Link } from 'react-router';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/common/components/ui/collapsible';
import { Input } from '~/common/components/ui/input';

interface ResponsiveClientDetailProps {
  client: any;
  clientTags?: any[];
  isEditing?: boolean;
  editFormData?: any;
  setEditFormData?: (data: any) => void;
  onEditStart?: () => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
  onSsnChange?: (ssnFront: string, ssnBack: string) => Promise<void>;
  onTagModalOpen?: () => void;
  onTagRemove?: (tagId: string) => void;
  availableReferrers?: any[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onDeleteClient?: () => void;
  onShowOpportunityModal?: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * ResponsiveClientDetail - 모바일 우선 반응형 고객 상세 뷰 컴포넌트
 *
 * 주요 기능:
 * - Mobile-first 반응형 레이아웃 (모바일 → 태블릿 → 데스크톱)
 * - 터치 친화적 UI 요소 (최소 44px 터치 타겟)
 * - 스와이프 네비게이션 및 햅틱 피드백
 * - 접근성 최적화 (Screen reader, Focus management)
 * - tel/mailto 직접 링크 지원
 * - 모바일에서는 Sheet 기반 네비게이션
 * - 태블릿에서는 사이드 패널 레이아웃
 */
export function ResponsiveClientDetail({
  client,
  clientTags = [],
  isEditing = false,
  editFormData,
  setEditFormData,
  onEditStart,
  onEditSave,
  onEditCancel,
  onSsnChange,
  onTagModalOpen,
  onTagRemove,
  availableReferrers,
  activeTab,
  onTabChange,
  onDeleteClient,
  onShowOpportunityModal,
  children,
  className,
}: ResponsiveClientDetailProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [isClientInfoExpanded, setIsClientInfoExpanded] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // 🌍 다국어 번역 훅 추가
  const { t } = useHydrationSafeTranslation('clients');

  // 🆕 개선된 디바이스 감지 훅 사용
  const deviceType = useDeviceType();
  const isTablet = useIsTablet();
  const isTouchDevice = useIsTouchDevice();

  // 캐러셀 스크롤 제어를 위한 ref
  const carouselRef = useRef<HTMLDivElement>(null);

  // 🎯 디바이스 타입에 따른 레이아웃 결정
  const shouldShowMobileLayout =
    deviceType === 'mobile' || (deviceType === 'tablet' && isTouchDevice);

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            {t('errors.clientDataLoad', '고객 정보를 불러올 수 없습니다.')}
          </p>
        </div>
      </div>
    );
  }

  // 중요도에 따른 색상 및 아이콘
  const getImportanceConfig = (importance: string) => {
    switch (importance) {
      case 'high':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50 border-red-200',
          icon: '🔥',
          label: t('importance.high', '키맨'),
        };
      case 'medium':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-50 border-yellow-200',
          icon: '⭐',
          label: t('importance.medium', '보통'),
        };
      case 'low':
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50 border-gray-200',
          icon: '📄',
          label: t('importance.low', '낮음'),
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50 border-gray-200',
          icon: '📄',
          label: t('importance.medium', '보통'),
        };
    }
  };

  const importanceConfig = getImportanceConfig(client.importance);

  // 모바일 탭 구성 (가로 스크롤 가능한 탭) - 다국어 지원
  const mobileTabs = useMemo(
    () => [
      { id: 'notes', label: t('tabs.notes', '상담내용'), icon: MessageCircle },
      { id: 'medical', label: t('tabs.medical', '병력사항'), icon: FileText },
      { id: 'checkup', label: t('tabs.purposes', '점검목적'), icon: Target },
      { id: 'interests', label: t('tabs.interests', '관심사항'), icon: Star },
      {
        id: 'companions',
        label: t('tabs.companions', '상담동반자'),
        icon: User,
      },
      { id: 'insurance', label: t('tabs.contracts', '보험계약'), icon: Shield },
      { id: 'family', label: t('tabs.family', '가족'), icon: Network },
    ],
    [t]
  );

  // 탭 변경 시 캐러셀 자동 스크롤
  useEffect(() => {
    if (carouselRef.current && activeTab) {
      const currentIndex = mobileTabs.findIndex(tab => tab.id === activeTab);
      if (currentIndex !== -1) {
        const carousel = carouselRef.current;
        const tabButton = carousel.children[currentIndex] as HTMLElement;

        if (tabButton) {
          // 자연스러운 스크롤을 위해 requestAnimationFrame 사용
          requestAnimationFrame(() => {
            const carouselRect = carousel.getBoundingClientRect();
            const buttonRect = tabButton.getBoundingClientRect();
            const scrollLeft =
              buttonRect.left -
              carouselRect.left +
              carousel.scrollLeft -
              carouselRect.width / 2 +
              buttonRect.width / 2;

            // 스크롤 애니메이션 시간을 좀 더 부드럽게
            carousel.scrollTo({
              left: scrollLeft,
              behavior: 'smooth',
            });
          });
        }
      }
    }
  }, [activeTab]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  const calculateBMI = (height: string, weight: string) => {
    if (!height || !weight) return null;
    const h = parseFloat(height) / 100; // cm를 m로 변환
    const w = parseFloat(weight);
    if (h <= 0 || w <= 0) return null;
    return (w / (h * h)).toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5)
      return {
        label: t('sidebar.bmiUnderweight', '저체중'),
        color: 'text-blue-600 bg-blue-50',
      };
    if (bmi < 23)
      return {
        label: t('sidebar.bmiNormal', '정상'),
        color: 'text-green-600 bg-green-50',
      };
    if (bmi < 25)
      return {
        label: t('sidebar.bmiOverweight', '과체중'),
        color: 'text-yellow-600 bg-yellow-50',
      };
    return {
      label: t('sidebar.bmiObese', '비만'),
      color: 'text-red-600 bg-red-50',
    };
  };

  // 단계 이름 번역 함수
  const getStageDisplayName = (stageName: string) => {
    if (!stageName) return t('sidebar.notSet', '미설정');

    // 단계 이름을 번역 키로 매핑
    const stageKeyMap: Record<string, string> = {
      잠재고객: 'stages.prospect',
      '첫 상담': 'stages.firstConsultation',
      상담: 'stages.consultation',
      '니즈 분석': 'stages.needsAnalysis',
      '상품 설명': 'stages.proposal',
      상품설명: 'stages.proposal',
      '계약 검토': 'stages.contractReview',
      계약검토: 'stages.contractReview',
      '계약 완료': 'stages.contractCompleted',
      계약완료: 'stages.contractCompleted',
      리드: 'stages.lead',
      검증됨: 'stages.qualified',
      실패: 'stages.lost',
      제외됨: 'stages.excluded',
    };

    const translationKey = stageKeyMap[stageName];
    if (translationKey) {
      return t(translationKey, stageName);
    }

    // 매핑되지 않은 경우 원본 반환
    return stageName;
  };

  // 캐러셀 네비게이션 함수들
  const goToPrevTab = () => {
    const currentIndex = mobileTabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      onTabChange?.(mobileTabs[currentIndex - 1].id);
    }
  };

  const goToNextTab = () => {
    const currentIndex = mobileTabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < mobileTabs.length - 1) {
      onTabChange?.(mobileTabs[currentIndex + 1].id);
    }
  };

  // 탭 캐러셀 터치 이벤트 (스와이프 자동 이동 제거)
  const handleTouchStart = (e: React.TouchEvent) => {
    // 터치 시작점만 기록 (자동 이동 없음)
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 터치 이동 처리 (자동 이동 없음)
  };

  const handleTouchEnd = () => {
    // 터치 종료 처리 (자동 이동 없음)
  };

  return (
    <div className={cn('w-full', className)}>
      {/* 🎯 모바일/태블릿 레이아웃 (개선된 디바이스 감지 기반) */}
      {shouldShowMobileLayout && (
        <div className="bg-background">
          {/* 🆕 모바일/태블릿 기본정보 접기/펼치기 섹션 */}
          <div className="border-b bg-background ">
            <Collapsible
              open={isClientInfoExpanded}
              onOpenChange={setIsClientInfoExpanded}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                >
                  <span className="font-medium text-sm">
                    {t('sidebar.basicInfo', '기본정보')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isClientInfoExpanded && 'rotate-180'
                    )}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4">
                  {/* 편집 버튼 섹션 */}
                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={onEditSave}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {t('header.save', '저장')}
                        </Button>
                        <Button
                          onClick={onEditCancel}
                          size="sm"
                          variant="outline"
                        >
                          <X className="h-4 w-4 mr-1" />
                          {t('header.cancel', '취소')}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={onEditStart}
                          size="sm"
                          variant="outline"
                          className="hover:bg-primary/10"
                          title={t('sidebar.editTooltip', '고객 정보 편집')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={onDeleteClient}
                          size="sm"
                          variant="outline"
                          className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          title={t('sidebar.deleteTooltip', '고객 삭제')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* 연락처 정보 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {t('labels.contacts', '연락처 정보')}
                    </h4>

                    {/* 전화번호 */}
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editFormData?.phone || ''}
                          onChange={e =>
                            setEditFormData?.({
                              ...editFormData,
                              phone: e.target.value,
                            })
                          }
                          placeholder={t('fields.phone', '전화번호')}
                          className="text-sm"
                        />
                      ) : (
                        <a
                          href={client.phone ? `tel:${client.phone}` : '#'}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {client.phone || t('sidebar.noInfo', '정보 없음')}
                        </a>
                      )}
                    </div>

                    {/* 이메일 */}
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editFormData?.email || ''}
                          onChange={e =>
                            setEditFormData?.({
                              ...editFormData,
                              email: e.target.value,
                            })
                          }
                          placeholder={t('fields.email', 'email@example.com')}
                          type="email"
                          className="text-sm"
                        />
                      ) : (
                        <a
                          href={client.email ? `mailto:${client.email}` : '#'}
                          className="text-sm text-green-600 hover:underline"
                        >
                          {client.email || (
                            <span
                              className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                              onClick={onEditStart}
                              title={t('sidebar.clickToInput', '클릭하여 입력')}
                            >
                              {t('sidebar.emailNotSet', '이메일 미입력')}
                            </span>
                          )}
                        </a>
                      )}
                    </div>

                    {/* 주소 */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      {isEditing ? (
                        <Input
                          value={editFormData?.address || ''}
                          onChange={e =>
                            setEditFormData?.({
                              ...editFormData,
                              address: e.target.value,
                            })
                          }
                          placeholder={t('fields.address', '주소')}
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm leading-relaxed">
                          {client.address || (
                            <span
                              className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                              onClick={onEditStart}
                              title={t('sidebar.clickToInput', '클릭하여 입력')}
                            >
                              {t('sidebar.addressNotSet', '주소 미입력')}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* 직업 */}
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editFormData?.occupation || ''}
                          onChange={e =>
                            setEditFormData?.({
                              ...editFormData,
                              occupation: e.target.value,
                            })
                          }
                          placeholder={t('fields.occupation', '직업')}
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm">
                          {client.occupation || (
                            <span
                              className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                              onClick={onEditStart}
                              title={t('sidebar.clickToInput', '클릭하여 입력')}
                            >
                              {t('sidebar.occupationNotSet', '직업 미입력')}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* 통신사 정보 */}
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-4 text-muted-foreground flex items-center justify-center">
                        📱
                      </span>
                      {isEditing ? (
                        <select
                          value={editFormData?.telecomProvider || 'none'}
                          onChange={e =>
                            setEditFormData?.({
                              ...editFormData,
                              telecomProvider: e.target.value,
                            })
                          }
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="none">
                            {t('sidebar.selectTelecom', '통신사 선택')}
                          </option>
                          <option value="skt">
                            {t('sidebar.telecomSKT', 'SKT')}
                          </option>
                          <option value="kt">
                            {t('sidebar.telecomKT', 'KT')}
                          </option>
                          <option value="lg">
                            {t('sidebar.telecomLGU', 'LG U+')}
                          </option>
                          <option value="mvno">
                            {t('sidebar.telecomBudgetSKT', '알뜰폰')}
                          </option>
                        </select>
                      ) : (
                        <span className="text-sm">
                          <span className="text-xs text-muted-foreground mr-2">
                            {t('sidebar.telecomLabel', '통신사')}
                          </span>
                          {client.telecomProvider || (
                            <span
                              className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                              onClick={onEditStart}
                              title={t(
                                'sidebar.clickToSelect',
                                '클릭하여 선택'
                              )}
                            >
                              {t('sidebar.notSelected', '미선택')}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* 현재 단계 */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      {t('sidebar.currentStage', '현재 단계')}
                    </h4>
                    <Badge
                      variant="outline"
                      className="w-full justify-center h-10 text-md font-semibold"
                    >
                      {getStageDisplayName(client.currentStage?.name)}
                    </Badge>
                    {!client.currentStage?.name && (
                      <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded border-l-2 border-muted-foreground/30">
                        💡 <strong>{t('sidebar.notSet', '미설정')}</strong>
                        {t(
                          'sidebar.notInPipelineHelp',
                          '은 아직 영업 파이프라인에 진입하지 않은 상태입니다. "새 영업 기회" 버튼을 눌러 파이프라인에 추가할 수 있습니다.'
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* 개인 상세 정보 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      {t('sidebar.personalInfo', '개인 정보')}
                    </h4>

                    {/* 생년월일 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[50px]">
                        {t('sidebar.birthDate', '생년월일')}
                      </span>
                      {!isEditing ? (
                        client.extendedDetails?.birthDate ? (
                          <div className="space-y-1">
                            <span className="text-sm">
                              {new Date(
                                client.extendedDetails.birthDate
                              ).toLocaleDateString('ko-KR')}
                            </span>
                            {/* 3가지 나이 표시 */}
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>
                                {t('sidebar.standardAge', '만 나이')}:{' '}
                                {calculateAge(client.extendedDetails.birthDate)}
                                {t('sidebar.ageUnit', '세')}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span
                            className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                            onClick={onEditStart}
                            title={t('sidebar.clickToInput', '클릭하여 입력')}
                          >
                            {t('sidebar.birthDateNotSet', '생년월일 미입력')}
                          </span>
                        )
                      ) : (
                        <div className="flex-1">
                          <Input
                            type="date"
                            value={editFormData?.birthDate || ''}
                            onChange={e =>
                              setEditFormData?.({
                                ...editFormData,
                                birthDate: e.target.value,
                              })
                            }
                            className="text-sm"
                          />
                          {/* 수정 중 나이 미리보기 */}
                          {editFormData?.birthDate && (
                            <div className="mt-2 p-2 border rounded-md bg-muted/20">
                              <div className="text-xs text-foreground font-medium mb-1">
                                📅 {t('sidebar.agePreview', '나이 미리보기')}:
                              </div>
                              <div className="text-xs space-y-1">
                                <div>
                                  <span className="text-green-700 dark:text-green-400">
                                    {t('sidebar.standardAge', '만 나이')}:
                                  </span>
                                  <span className="ml-1 font-medium text-foreground">
                                    {calculateAge(editFormData.birthDate)}
                                    {t('sidebar.ageUnit', '세')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 성별 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[50px]">
                        {t('sidebar.gender', '성별')}
                      </span>
                      {!isEditing ? (
                        client.extendedDetails?.gender ? (
                          <Badge variant="outline" className="text-xs">
                            {client.extendedDetails.gender === 'male'
                              ? t('sidebar.male', '남성')
                              : t('sidebar.female', '여성')}
                          </Badge>
                        ) : (
                          <span
                            className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                            onClick={onEditStart}
                            title={t('sidebar.clickToInput', '클릭하여 입력')}
                          >
                            {t('sidebar.genderNotSet', '성별 미입력')}
                          </span>
                        )
                      ) : (
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value="male"
                              checked={editFormData?.gender === 'male'}
                              onChange={e =>
                                setEditFormData?.({
                                  ...editFormData,
                                  gender: e.target.value,
                                })
                              }
                              className="text-xs"
                            />
                            <span className="text-xs">
                              {t('sidebar.male', '남성')}
                            </span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value="female"
                              checked={editFormData?.gender === 'female'}
                              onChange={e =>
                                setEditFormData?.({
                                  ...editFormData,
                                  gender: e.target.value,
                                })
                              }
                              className="text-xs"
                            />
                            <span className="text-xs">
                              {t('sidebar.female', '여성')}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* 신체 정보 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      {t('sidebar.bodyInfo', '신체 정보')}
                    </h4>

                    {/* 키 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[40px]">
                        {t('sidebar.height', '키')}
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editFormData?.height || ''}
                            onChange={e =>
                              setEditFormData?.({
                                ...editFormData,
                                height: e.target.value,
                              })
                            }
                            placeholder="170"
                            className="text-sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            {t('sidebar.cmUnit', 'cm')}
                          </span>
                        </div>
                      ) : client.height ? (
                        <span className="text-sm">
                          {client.height}
                          {t('sidebar.cmUnit', 'cm')}
                        </span>
                      ) : (
                        <span
                          className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                          onClick={onEditStart}
                          title={t('sidebar.clickToInput', '클릭하여 입력')}
                        >
                          {t('sidebar.notEntered', '미입력')}
                        </span>
                      )}
                    </div>

                    {/* 몸무게 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[40px]">
                        {t('sidebar.weight', '몸무게')}
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editFormData?.weight || ''}
                            onChange={e =>
                              setEditFormData?.({
                                ...editFormData,
                                weight: e.target.value,
                              })
                            }
                            placeholder="70"
                            className="text-sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            {t('sidebar.kgUnit', 'kg')}
                          </span>
                        </div>
                      ) : client.weight ? (
                        <span className="text-sm">
                          {client.weight}
                          {t('sidebar.kgUnit', 'kg')}
                        </span>
                      ) : (
                        <span
                          className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                          onClick={onEditStart}
                          title={t('sidebar.clickToInput', '클릭하여 입력')}
                        >
                          {t('sidebar.notEntered', '미입력')}
                        </span>
                      )}
                    </div>

                    {/* BMI 표시 */}
                    {((isEditing &&
                      editFormData?.height &&
                      editFormData?.weight) ||
                      (!isEditing && client.height && client.weight)) && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground min-w-[40px]">
                          {t('sidebar.bmi', 'BMI')}
                        </span>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {calculateBMI(
                                (isEditing
                                  ? editFormData?.height
                                  : client.height
                                )?.toString() || '',
                                (isEditing
                                  ? editFormData?.weight
                                  : client.weight
                                )?.toString() || ''
                              )}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {
                                getBMIStatus(
                                  parseFloat(
                                    calculateBMI(
                                      (isEditing
                                        ? editFormData?.height
                                        : client.height
                                      )?.toString() || '',
                                      (isEditing
                                        ? editFormData?.weight
                                        : client.weight
                                      )?.toString() || ''
                                    ) || '0'
                                  )
                                ).label
                              }
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 운전 여부 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[40px]">
                        {t('sidebar.driving', '운전')}
                      </span>
                      {isEditing ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editFormData?.hasDrivingLicense || false}
                            onChange={e =>
                              setEditFormData?.({
                                ...editFormData,
                                hasDrivingLicense: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span className="text-sm">
                            {t('sidebar.canDrive', '운전 가능')}
                          </span>
                        </label>
                      ) : (
                        <Badge
                          variant={
                            client.hasDrivingLicense ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {client.hasDrivingLicense !== undefined
                            ? client.hasDrivingLicense
                              ? t('sidebar.canDrive', '운전 가능')
                              : t('sidebar.cannotDrive', '운전 불가')
                            : t('sidebar.notSet', '미설정')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 주민등록번호 입력 - 수정 모드에서만 표시 */}
                  {isEditing && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                          🔒{' '}
                          {t(
                            'sidebar.sensitiveDataManagement',
                            '민감정보 관리'
                          )}
                        </h4>
                        <div className="border border-border rounded-lg p-4 bg-muted/30">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-medium text-foreground">
                                {t('sidebar.ssnLabel', '주민등록번호')}
                              </span>
                              <span className="text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded border border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800">
                                ⚠️ {t('sidebar.sensitiveData', '민감정보')}
                              </span>
                            </div>

                            {/* 주민등록번호 분리 입력 */}
                            <div className="grid grid-cols-5 gap-2 items-center">
                              <Input
                                type="text"
                                placeholder="YYMMDD"
                                value={editFormData?.ssnFront || ''}
                                onChange={e => {
                                  const value = e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 6);
                                  onSsnChange?.(
                                    value,
                                    editFormData?.ssnBack || ''
                                  );
                                }}
                                className="col-span-2 text-center font-mono"
                                maxLength={6}
                              />
                              <span className="text-muted-foreground font-bold text-center">
                                -
                              </span>
                              <Input
                                type="text"
                                placeholder="1●●●●●●"
                                value={editFormData?.ssnBack || ''}
                                onChange={e => {
                                  const value = e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 7);
                                  onSsnChange?.(
                                    editFormData?.ssnFront || '',
                                    value
                                  );
                                }}
                                className="col-span-2 text-center font-mono"
                                maxLength={7}
                              />
                            </div>

                            {/* 주민등록번호 입력 도움말 */}
                            <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <span>ℹ️</span>
                                  <span className="font-medium">
                                    {t(
                                      'sidebar.ssnAutoCalculate',
                                      '주민등록번호 입력 시 자동으로 생년월일이 계산됩니다.'
                                    )}
                                  </span>
                                </div>
                                <div className="text-xs text-amber-700 dark:text-amber-300">
                                  •{' '}
                                  {t(
                                    'sidebar.ssnFrontHelp',
                                    '앞자리: 생년월일 6자리 (YYMMDD)'
                                  )}
                                </div>
                                <div className="text-xs text-amber-700 dark:text-amber-300">
                                  •{' '}
                                  {t(
                                    'sidebar.ssnBackHelp',
                                    '뒷자리: 성별 및 세기 포함 7자리'
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* 소개 정보 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      {t('sidebar.referralInfo', '소개 정보')}
                    </h4>

                    {/* 누가 이 고객을 소개했는지 */}
                    <div className="flex items-center gap-3">
                      <Network className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          {t(
                            'sidebar.whoReferredClient',
                            '이 고객을 소개한 사람'
                          )}
                        </div>
                        {isEditing ? (
                          <div className="space-y-2">
                            <select
                              value={editFormData?.referredById || 'none'}
                              onChange={e => {
                                const actualValue =
                                  e.target.value === 'none'
                                    ? undefined
                                    : e.target.value;
                                setEditFormData?.({
                                  ...editFormData,
                                  referredById: actualValue,
                                });
                              }}
                              className="w-full text-sm border rounded px-2 py-1"
                            >
                              <option value="none">
                                {t(
                                  'sidebar.directDevelopment',
                                  '직접 개발 (소개자 없음)'
                                )}
                              </option>
                              {availableReferrers?.map(referrer => (
                                <option key={referrer.id} value={referrer.id}>
                                  {referrer.name}
                                </option>
                              ))}
                            </select>
                            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-1">
                                <span>💡</span>
                                <span>
                                  {t(
                                    'sidebar.referrerChangeHelp',
                                    '소개자를 변경하면 소개 네트워크가 업데이트됩니다.'
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : client.referredBy ? (
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/clients/${client.referredBy.id}`}
                              className="text-sm text-primary hover:underline font-medium"
                            >
                              {client.referredBy.name}
                            </Link>
                            <Badge variant="outline" className="text-xs">
                              {t('sidebar.referrerBadge', '소개자')}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {t('sidebar.directClient', '직접 개발 고객')}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {t('sidebar.newDevelopment', '신규 개발')}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 이 고객이 소개한 다른 고객들 */}
                    <div className="flex items-start gap-3">
                      <Network className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          {t(
                            'sidebar.clientsReferredBy',
                            '이 고객이 소개한 사람들'
                          )}
                        </div>
                        {client.referredClients &&
                        client.referredClients.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">
                                {t(
                                  'sidebar.totalReferrals',
                                  '총 {{count}}명 소개',
                                  { count: client.referralCount }
                                )}
                              </span>
                              <Badge
                                variant="default"
                                className="text-xs bg-green-100 text-green-700 border-green-300"
                              >
                                {t(
                                  'sidebar.referralContributor',
                                  '소개 기여자'
                                )}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              {client.referredClients.map(
                                (referredClient: any, index: number) => (
                                  <div
                                    key={referredClient.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Link
                                      to={`/clients/${referredClient.id}`}
                                      className="text-sm text-primary hover:underline font-medium"
                                    >
                                      {index + 1}. {referredClient.name}
                                    </Link>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {new Date(
                                        referredClient.createdAt
                                      ).toLocaleDateString('ko-KR')}
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {t(
                                'sidebar.noReferralsYet',
                                '아직 소개한 고객이 없습니다'
                              )}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {t('sidebar.potentialReferrer', '잠재 소개자')}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 태그 섹션 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        {t('sidebar.tags', '태그')}
                      </h4>
                      {clientTags.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onTagModalOpen}
                          className="h-6 text-xs"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          {t('header.edit', '편집')}
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {clientTags.length > 0 ? (
                        clientTags.map((tag: any) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-secondary/80 group relative"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color,
                            }}
                          >
                            <span style={{ color: tag.color }}>{tag.name}</span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onTagRemove?.(tag.id);
                              }}
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <div className="text-center py-3 w-full">
                          <Target className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-2">
                            {t('sidebar.noTags', '태그가 없습니다')}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={onTagModalOpen}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {t('sidebar.addTag', '태그 추가')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* 🎨 모던 스마트 탭 네비게이션 - 완전 재설계 */}
          <div className="sticky -top-4 z-40 bg-background border-b border-border/50 -mx-4 px-4 shadow-sm py-1">
            <div className="relative">
              {/* 탭 컨테이너 */}
              <div className="relative overflow-hidden">
                <div
                  ref={carouselRef}
                  className="flex gap-3 px-4 py-2.5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide scrollbar-none tab-carousel-container"
                  data-scrollbar-hidden="true"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={
                    {
                      scrollBehavior: 'smooth',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      scrollbarColor: 'transparent transparent',
                    } as React.CSSProperties
                  }
                >
                  {mobileTabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange?.(tab.id)}
                        data-active={isActive}
                        className={cn(
                          // 기본 스타일 - 모든 탭에 공통 적용
                          'relative flex-shrink-0 flex items-center gap-1.5 text-xs font-medium',
                          'snap-center border min-w-fit overflow-hidden',
                          'transform-gpu will-change-transform backface-hidden',
                          // 🎯 새로운 부드러운 애니메이션을 위한 클래스 추가
                          'tab-carousel-button',
                          // 🎯 부드러운 크기 및 border-radius 전환을 위한 CSS 변수 사용
                          isActive
                            ? [
                                // 활성 탭: 미묘한 패딩 증가와 일관된 rounded 값
                                'px-3.5 py-1.5 rounded-lg',
                                'bg-primary text-white',
                                'shadow-sm shadow-primary/20 border-primary/30',
                                'translate-y-0 z-10',
                              ]
                            : [
                                // 비활성 탭: 기본 패딩과 rounded 값
                                'px-3 py-1.5 rounded-lg',
                                'bg-muted/30 text-muted-foreground border-border/30',
                                'hover:bg-muted/50 hover:text-foreground/80',
                                'hover:shadow-sm hover:border-border/50',
                                'translate-y-0 z-0',
                              ]
                        )}
                        style={{
                          // 🚀 부드럽고 일관된 전환 애니메이션
                          transition: [
                            // 모든 속성을 동시에, 부드럽게 전환
                            'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          ].join(', '),
                        }}
                      >
                        {/* 아이콘 */}
                        <div
                          className={cn(
                            'transition-all duration-300 ease-out flex-shrink-0',
                            // 🎯 아이콘 크기도 부드럽게 전환 (더 미묘하게)
                            isActive ? 'scale-105' : 'scale-100'
                          )}
                        >
                          <Icon
                            className={cn(
                              'transition-all duration-300 ease-out',
                              isActive ? 'h-3.5 w-3.5 text-white' : 'h-3 w-3'
                            )}
                          />
                        </div>

                        {/* 라벨 */}
                        <span
                          className={cn(
                            'text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out',
                            // 🎯 폰트 두께도 부드럽게 전환 (더 미묘하게)
                            isActive
                              ? 'font-medium tracking-normal text-white'
                              : 'font-normal tracking-normal'
                          )}
                        >
                          {tab.label}
                        </span>

                        {/* 🎨 호버 시 배경 효과 - 비활성 탭에만 */}
                        {!isActive && (
                          <div
                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/5 to-accent/10 opacity-0 hover:opacity-100 transition-all duration-300 ease-out -z-20"
                            style={{
                              transform: 'translate3d(0, 0, 0)',
                              transition:
                                'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 모바일/태블릿 탭 컨텐츠 영역 */}
          <div className="p-4 pb-20">{children}</div>
        </div>
      )}

      {/* 🎯 데스크톱 레이아웃 - 터치 디바이스가 아닌 경우에만 표시 */}
      {!shouldShowMobileLayout && (
        <div className="bg-background">{children}</div>
      )}
    </div>
  );
}

export default ResponsiveClientDetail;
