import { Link } from 'react-router';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Network,
  Target,
  Plus,
  Edit2,
  X,
  Save,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Input } from '~/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Separator } from '~/common/components/ui/separator';
import {
  getClientCardStyle,
  getImportanceBadge,
  IMPORTANCE_OPTIONS,
  TELECOM_PROVIDER_OPTIONS,
  calculateAge,
  calculateBMI,
  getBMIStatus,
} from '../lib/client-detail-utils';
import type { ClientDetailProfile } from '../types/client-detail';

interface ClientSidebarProps {
  client: ClientDetailProfile | null;
  isEditing: boolean;
  editFormData: any;
  setEditFormData: (data: any) => void;
  handleEditStart: () => void;
  handleEditSave: () => void;
  handleEditCancel: () => void;
  handleSsnChange: (ssnFront: string, ssnBack: string) => void;
  clientTags: any[];
  handleOpenTagModal: () => void;
  removeClientTag: (tagId: string) => void;
  availableReferrers?: Array<{ id: string; name: string }>; // 🆕 소개자 후보 목록
}

export function ClientSidebar({
  client,
  isEditing,
  editFormData,
  setEditFormData,
  handleEditStart,
  handleEditSave,
  handleEditCancel,
  handleSsnChange,
  clientTags,
  handleOpenTagModal,
  removeClientTag,
  availableReferrers = [], // 🆕 소개자 후보 목록
}: ClientSidebarProps) {
  const cardStyle = getClientCardStyle(client?.importance || 'medium');

  // BMI 계산 로직
  const currentBMI =
    client?.height && client?.weight
      ? calculateBMI(client.height.toString(), client.weight.toString())
      : null;

  const editingBMI =
    isEditing && editFormData.height && editFormData.weight
      ? calculateBMI(
          editFormData.height.toString(),
          editFormData.weight.toString()
        )
      : null;

  return (
    <div className="lg:col-span-1 mb-6">
      <div className="relative">
        <Card
          className={`sticky top-6 border-border/50 ${cardStyle.bgGradient} ${cardStyle.borderClass} overflow-hidden`}
        >
          <CardHeader className="text-center pb-2">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1" />
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 flex justify-end">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleEditSave}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                    <Button
                      onClick={handleEditCancel}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-1" />
                      취소
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleEditStart}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    편집
                  </Button>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    고객명
                  </label>
                  <Input
                    value={editFormData.fullName}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        fullName: e.target.value,
                      })
                    }
                    className="text-center text-lg font-semibold"
                    placeholder="고객명"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    중요도
                  </label>
                  <Select
                    value={editFormData.importance}
                    onValueChange={(value: 'high' | 'medium' | 'low') =>
                      setEditFormData({
                        ...editFormData,
                        importance: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="중요도" />
                    </SelectTrigger>
                    <SelectContent>
                      {IMPORTANCE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <>
                <CardTitle className="text-xl">
                  {client?.fullName || '고객'}
                </CardTitle>
                <div className="flex justify-center">
                  {(() => {
                    const { style, text } = getImportanceBadge(
                      client?.importance || 'medium'
                    );
                    return <Badge className={style}>{text}</Badge>;
                  })()}
                </div>
              </>
            )}
          </CardHeader>

          <CardContent className="p-6 pt-3 space-y-4">
            {/* 연락처 정보 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={editFormData.phone}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="전화번호"
                    className="text-sm"
                  />
                ) : (
                  <span className="text-sm">
                    {client?.phone || '정보 없음'}
                  </span>
                )}
              </div>

              {/* 이메일 */}
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={editFormData.email}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    placeholder="email@example.com"
                    type="email"
                    className="text-sm"
                  />
                ) : (
                  <span className="text-sm">
                    {client?.email || (
                      <span
                        className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                        onClick={handleEditStart}
                        title="클릭하여 입력"
                      >
                        이메일 미입력
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* 주소 - 항상 표시 */}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                {isEditing ? (
                  <Input
                    value={editFormData.address}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        address: e.target.value,
                      })
                    }
                    placeholder="주소"
                    className="text-sm"
                  />
                ) : (
                  <span className="text-sm leading-relaxed">
                    {client?.address || (
                      <span
                        className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                        onClick={handleEditStart}
                        title="클릭하여 입력"
                      >
                        주소 미입력
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* 직업 - 항상 표시 */}
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={editFormData.occupation}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        occupation: e.target.value,
                      })
                    }
                    placeholder="직업"
                    className="text-sm"
                  />
                ) : (
                  <span className="text-sm">
                    {client?.occupation || (
                      <span
                        className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                        onClick={handleEditStart}
                        title="클릭하여 입력"
                      >
                        직업 미입력
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* 통신사 정보 - 항상 표시 */}
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 text-muted-foreground flex items-center justify-center">
                  📱
                </span>
                {isEditing ? (
                  <Select
                    value={editFormData.telecomProvider || 'none'}
                    onValueChange={value =>
                      setEditFormData({
                        ...editFormData,
                        telecomProvider: value,
                      })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="통신사 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {TELECOM_PROVIDER_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm">
                    <span className="text-xs text-muted-foreground mr-2">
                      통신사
                    </span>
                    {client?.telecomProvider || (
                      <span
                        className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                        onClick={handleEditStart}
                        title="클릭하여 선택"
                      >
                        미선택
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* 현재 단계 - 위로 이동 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">현재 단계</h4>
              <Badge
                variant="outline"
                className="w-full justify-center h-10 text-md font-semibold"
              >
                {client?.currentStage?.name || '미설정'}
              </Badge>
              {!client?.currentStage?.name && (
                <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded border-l-2 border-muted-foreground/30">
                  💡 <strong>미설정</strong>은 아직 영업 파이프라인에 진입하지
                  않은 상태입니다. "새 영업 기회" 버튼을 눌러 파이프라인에
                  추가할 수 있습니다.
                </div>
              )}
            </div>

            <Separator />

            {/* 개인 상세 정보 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">개인 정보</h4>

              {/* 생년월일 - 항상 표시 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground min-w-[50px]">
                  생년월일
                </span>
                {!isEditing ? (
                  client?.extendedDetails?.birthDate ? (
                    <div className="space-y-1">
                      <span className="text-sm">
                        {new Date(
                          client.extendedDetails.birthDate
                        ).toLocaleDateString('ko-KR')}
                      </span>
                      {/* 3가지 나이 표시 */}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          만 나이:{' '}
                          {calculateAge(
                            new Date(client.extendedDetails.birthDate),
                            'standard'
                          )}
                          세
                        </div>
                        <div>
                          한국 나이:{' '}
                          {calculateAge(
                            new Date(client.extendedDetails.birthDate),
                            'korean'
                          )}
                          세
                        </div>
                        <div>
                          보험 나이:{' '}
                          {calculateAge(
                            new Date(client.extendedDetails.birthDate),
                            'insurance'
                          )}
                          세
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span
                      className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                      onClick={handleEditStart}
                      title="클릭하여 입력"
                    >
                      생년월일 미입력
                    </span>
                  )
                ) : (
                  <>
                    <div className="flex-1">
                      <Input
                        type="date"
                        value={editFormData.birthDate}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            birthDate: e.target.value,
                          })
                        }
                        className="text-sm"
                      />
                      {/* 수정 중 나이 미리보기 */}
                      {editFormData.birthDate && (
                        <div className="mt-2 p-2 border rounded-md bg-muted/20">
                          <div className="text-xs text-foreground font-medium mb-1">
                            📅 나이 미리보기:
                          </div>
                          <div className="text-xs space-y-1">
                            <div>
                              <span className="text-green-700 dark:text-green-400">
                                만 나이:
                              </span>
                              <span className="ml-1 font-medium text-foreground">
                                {calculateAge(
                                  new Date(editFormData.birthDate),
                                  'standard'
                                )}
                                세
                              </span>
                            </div>
                            <div>
                              <span className="text-amber-700 dark:text-amber-400">
                                한국 나이:
                              </span>
                              <span className="ml-1 font-medium text-foreground">
                                {calculateAge(
                                  new Date(editFormData.birthDate),
                                  'korean'
                                )}
                                세
                              </span>
                            </div>
                            <div>
                              <span className="text-blue-700 dark:text-blue-400">
                                보험 나이:
                              </span>
                              <span className="ml-1 font-medium text-foreground">
                                {calculateAge(
                                  new Date(editFormData.birthDate),
                                  'insurance'
                                )}
                                세
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* 🆕 성별 - 항상 표시 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground min-w-[50px]">
                  성별
                </span>
                {!isEditing ? (
                  client?.extendedDetails?.gender ? (
                    <Badge variant="outline" className="text-xs">
                      {client.extendedDetails.gender === 'male'
                        ? '남성'
                        : '여성'}
                    </Badge>
                  ) : (
                    <span
                      className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                      onClick={handleEditStart}
                      title="클릭하여 입력"
                    >
                      성별 미입력
                    </span>
                  )
                ) : (
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={editFormData.gender === 'male'}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            gender: e.target.value,
                          })
                        }
                        className="text-xs"
                      />
                      <span className="text-xs">남성</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={editFormData.gender === 'female'}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            gender: e.target.value,
                          })
                        }
                        className="text-xs"
                      />
                      <span className="text-xs">여성</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* 신체 정보 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">신체 정보</h4>

              {/* 키 - 항상 표시 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground min-w-[40px]">
                  키
                </span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editFormData.height}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        height: e.target.value,
                      })
                    }
                    placeholder="170"
                    className="text-sm"
                  />
                ) : client?.height ? (
                  <span className="text-sm">{client.height}cm</span>
                ) : (
                  <span
                    className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                    onClick={handleEditStart}
                    title="클릭하여 입력"
                  >
                    미입력
                  </span>
                )}
                {isEditing && (
                  <span className="text-xs text-muted-foreground">cm</span>
                )}
              </div>

              {/* 몸무게 - 항상 표시 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground min-w-[40px]">
                  몸무게
                </span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editFormData.weight}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        weight: e.target.value,
                      })
                    }
                    placeholder="70"
                    className="text-sm"
                  />
                ) : client?.weight ? (
                  <span className="text-sm">{client.weight}kg</span>
                ) : (
                  <span
                    className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                    onClick={handleEditStart}
                    title="클릭하여 입력"
                  >
                    미입력
                  </span>
                )}
                {isEditing && (
                  <span className="text-xs text-muted-foreground">kg</span>
                )}
              </div>

              {/* 🎯 BMI 표시 - 키와 몸무게가 모두 있을 때만 */}
              {((isEditing && editingBMI) || (!isEditing && currentBMI)) && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-[40px]">
                    BMI
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {isEditing ? editingBMI : currentBMI}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          getBMIStatus(
                            isEditing ? editingBMI! : currentBMI!,
                            // 🎯 성별 정보 전달 (수정 중이면 editFormData, 아니면 client에서)
                            isEditing
                              ? editFormData.gender
                              : client?.extendedDetails?.gender
                          ).color
                        }`}
                      >
                        {
                          getBMIStatus(
                            isEditing ? editingBMI! : currentBMI!,
                            isEditing
                              ? editFormData.gender
                              : client?.extendedDetails?.gender
                          ).status
                        }
                      </Badge>
                    </div>
                    {/* 🆕 성별별 기준 표시 */}
                    <div className="text-xs text-muted-foreground">
                      {
                        getBMIStatus(
                          isEditing ? editingBMI! : currentBMI!,
                          isEditing
                            ? editFormData.gender
                            : client?.extendedDetails?.gender
                        ).detail
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* 운전 여부 - 항상 표시 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground min-w-[40px]">
                  운전
                </span>
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.hasDrivingLicense}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          hasDrivingLicense: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">운전 가능</span>
                  </label>
                ) : (
                  <Badge
                    variant={
                      client?.hasDrivingLicense ? 'default' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {client?.hasDrivingLicense !== undefined
                      ? client.hasDrivingLicense
                        ? '운전 가능'
                        : '운전 불가'
                      : '미설정'}
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
                    🔒 민감정보 관리
                  </h4>
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-foreground">
                          주민등록번호
                        </span>
                        <span className="text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded border border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800">
                          ⚠️ 민감정보
                        </span>
                      </div>

                      {/* 주민등록번호 분리 입력 - Full Width */}
                      <div className="grid grid-cols-5 gap-2 items-center">
                        <Input
                          type="text"
                          placeholder="YYMMDD"
                          value={editFormData.ssnFront}
                          onChange={e => {
                            const value = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 6);
                            handleSsnChange(value, editFormData.ssnBack);
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
                          value={editFormData.ssnBack}
                          onChange={e => {
                            const value = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 7);
                            handleSsnChange(editFormData.ssnFront, value);
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
                              주민등록번호 입력 시 자동으로 생년월일이
                              계산됩니다.
                            </span>
                          </div>
                          <div className="text-xs text-amber-700 dark:text-amber-300">
                            • 앞자리: 생년월일 6자리 (YYMMDD)
                          </div>
                          <div className="text-xs text-amber-700 dark:text-amber-300">
                            • 뒷자리: 성별 및 세기 포함 7자리
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
              <h4 className="text-sm font-medium">소개 정보</h4>

              {/* 누가 이 고객을 소개했는지 */}
              <div className="flex items-center gap-3">
                <Network className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">
                    이 고객을 소개한 사람
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Select
                        value={editFormData.referredById || 'none'}
                        onValueChange={value => {
                          const actualValue =
                            value === 'none' ? undefined : value;
                          setEditFormData({
                            ...editFormData,
                            referredById: actualValue,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full text-sm">
                          <SelectValue placeholder="소개자 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            직접 개발 (소개자 없음)
                          </SelectItem>
                          {/* 🆕 실제 고객 목록 렌더링 */}
                          {availableReferrers.map(referrer => (
                            <SelectItem key={referrer.id} value={referrer.id}>
                              {referrer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-1">
                          <span>💡</span>
                          <span>
                            소개자를 변경하면 소개 네트워크가 업데이트됩니다.
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : client?.referredBy ? (
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/clients/${client.referredBy.id}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {client.referredBy.name}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        소개자
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        직접 개발 고객
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        신규 개발
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
                    이 고객이 소개한 사람들
                  </div>
                  {client?.referredClients &&
                  client.referredClients.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">
                          총 {client.referralCount}명 소개
                        </span>
                        <Badge
                          variant="default"
                          className="text-xs bg-green-100 text-green-700 border-green-300"
                        >
                          소개 기여자
                        </Badge>
                      </div>
                      {/* 🔥 실제 소개한 사람들 이름 목록 */}
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
                              <Badge variant="outline" className="text-xs">
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
                        아직 소개한 고객이 없습니다
                      </span>
                      <Badge variant="outline" className="text-xs">
                        잠재 소개자
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
                <h4 className="text-sm font-medium">태그</h4>
                {clientTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenTagModal}
                    className="h-6 text-xs"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    편집
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
                          removeClientTag(tag.id);
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
                      태그가 없습니다
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={handleOpenTagModal}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      태그 추가
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
