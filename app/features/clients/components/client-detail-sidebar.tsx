import { useState, useCallback } from 'react';
import type { Client } from '~/lib/schema';
import type { EditFormData } from '../types/client-detail';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Separator } from '~/common/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Phone,
  Mail,
  MapPin,
  User,
  Building,
  Calendar,
  Award,
} from 'lucide-react';
import {
  calculateAge,
  calculateBMI,
  getBMIStatus,
  getClientCardStyle,
  getImportanceBadge,
  IMPORTANCE_OPTIONS,
  TELECOM_PROVIDER_OPTIONS,
} from '../lib/client-detail-utils';

interface ClientDetailSidebarProps {
  client: Client | null;
  isEditing: boolean;
  editFormData: EditFormData;
  onEditFormChange: (data: Partial<EditFormData>) => void;
  onEditStart: () => void;
  onSsnChange: (ssnFront: string, ssnBack: string) => void;
}

export function ClientDetailSidebar({
  client,
  isEditing,
  editFormData,
  onEditFormChange,
  onEditStart,
  onSsnChange,
}: ClientDetailSidebarProps) {
  // 카드 스타일 계산
  const importance = client?.importance || editFormData.importance || 'medium';
  const cardStyle = getClientCardStyle(importance);
  const { style: importanceBadgeStyle, text: importanceBadgeText } =
    getImportanceBadge(importance);

  // BMI 계산
  const currentBMI =
    client?.height && client?.weight
      ? calculateBMI(client.height.toString(), client.weight.toString())
      : null;

  const editingBMI =
    editFormData.height && editFormData.weight
      ? calculateBMI(editFormData.height, editFormData.weight)
      : null;

  // 나이 계산
  const age = client?.birthDate
    ? calculateAge(new Date(client.birthDate), 'standard')
    : null;
  const koreanAge = client?.birthDate
    ? calculateAge(new Date(client.birthDate), 'korean')
    : null;
  const insuranceAge = client?.birthDate
    ? calculateAge(new Date(client.birthDate), 'insurance')
    : null;

  return (
    <div className="relative">
      <Card
        className={`sticky top-6 border-border/50 ${cardStyle} overflow-hidden`}
      >
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-primary" />
          </div>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  고객명
                </label>
                <Input
                  value={editFormData.fullName}
                  onChange={(e) =>
                    onEditFormChange({ fullName: e.target.value })
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
                    onEditFormChange({ importance: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="중요도" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPORTANCE_OPTIONS.map((option) => (
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
                <Badge className={`text-xs ${importanceBadgeStyle}`}>
                  {importanceBadgeText}
                </Badge>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-3 space-y-4">
          {/* 연락처 정보 */}
          <div className="space-y-3">
            {/* 전화번호 */}
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                <Input
                  value={editFormData.phone}
                  onChange={(e) => onEditFormChange({ phone: e.target.value })}
                  placeholder="전화번호"
                  className="text-sm"
                />
              ) : (
                <span className="text-sm">{client?.phone || '정보 없음'}</span>
              )}
            </div>

            {/* 이메일 */}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                <Input
                  value={editFormData.email}
                  onChange={(e) => onEditFormChange({ email: e.target.value })}
                  placeholder="email@example.com"
                  type="email"
                  className="text-sm"
                />
              ) : (
                <span className="text-sm">
                  {client?.email || (
                    <span
                      className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                      onClick={onEditStart}
                      title="클릭하여 입력"
                    >
                      이메일 미입력
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* 주소 */}
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              {isEditing ? (
                <Textarea
                  value={editFormData.address}
                  onChange={(e) =>
                    onEditFormChange({ address: e.target.value })
                  }
                  placeholder="주소를 입력하세요"
                  className="text-sm min-h-[60px] resize-none"
                />
              ) : client?.address ? (
                <span className="text-sm leading-relaxed">
                  {client.address}
                </span>
              ) : (
                <span
                  className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                  onClick={onEditStart}
                  title="클릭하여 입력"
                >
                  주소 미입력
                </span>
              )}
            </div>

            {/* 직업 */}
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                <Input
                  value={editFormData.occupation}
                  onChange={(e) =>
                    onEditFormChange({ occupation: e.target.value })
                  }
                  placeholder="직업"
                  className="text-sm"
                />
              ) : client?.occupation ? (
                <span className="text-sm">{client.occupation}</span>
              ) : (
                <span
                  className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                  onClick={onEditStart}
                  title="클릭하여 입력"
                >
                  직업 미입력
                </span>
              )}
            </div>

            {/* 통신사 */}
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground min-w-[40px]">
                통신사
              </span>
              {isEditing ? (
                <Select
                  value={editFormData.telecomProvider}
                  onValueChange={(value) =>
                    onEditFormChange({ telecomProvider: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="통신사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택 안함</SelectItem>
                    <SelectItem value="skt">SKT</SelectItem>
                    <SelectItem value="kt">KT</SelectItem>
                    <SelectItem value="lgu">LG U+</SelectItem>
                    <SelectItem value="skt-budget">SKT 알뜰폰</SelectItem>
                    <SelectItem value="kt-budget">KT 알뜰폰</SelectItem>
                    <SelectItem value="lgu-budget">LG U+ 알뜰폰</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm">
                  {client?.telecomProvider === 'skt'
                    ? 'SKT'
                    : client?.telecomProvider === 'kt'
                    ? 'KT'
                    : client?.telecomProvider === 'lgu'
                    ? 'LG U+'
                    : client?.telecomProvider === 'skt-budget'
                    ? 'SKT 알뜰폰'
                    : client?.telecomProvider === 'kt-budget'
                    ? 'KT 알뜰폰'
                    : client?.telecomProvider === 'lgu-budget'
                    ? 'LG U+ 알뜰폰'
                    : '정보 없음'}
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* 개인 정보 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              개인 정보
            </h4>

            {/* 나이 표시 */}
            {age !== null && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm space-y-1">
                  <div>만 {age}세</div>
                  <div className="text-xs text-muted-foreground">
                    한국 나이: {koreanAge}세 · 보험 나이: {insuranceAge}세
                  </div>
                </div>
              </div>
            )}

            {/* 키 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground min-w-[40px]">
                키
              </span>
              {isEditing ? (
                <Input
                  type="number"
                  value={editFormData.height}
                  onChange={(e) => onEditFormChange({ height: e.target.value })}
                  placeholder="170"
                  className="text-sm"
                />
              ) : client?.height ? (
                <span className="text-sm">{client.height}cm</span>
              ) : (
                <span
                  className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                  onClick={onEditStart}
                  title="클릭하여 입력"
                >
                  미입력
                </span>
              )}
              {isEditing && (
                <span className="text-xs text-muted-foreground">cm</span>
              )}
            </div>

            {/* 몸무게 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground min-w-[40px]">
                몸무게
              </span>
              {isEditing ? (
                <Input
                  type="number"
                  value={editFormData.weight}
                  onChange={(e) => onEditFormChange({ weight: e.target.value })}
                  placeholder="70"
                  className="text-sm"
                />
              ) : client?.weight ? (
                <span className="text-sm">{client.weight}kg</span>
              ) : (
                <span
                  className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                  onClick={onEditStart}
                  title="클릭하여 입력"
                >
                  미입력
                </span>
              )}
              {isEditing && (
                <span className="text-xs text-muted-foreground">kg</span>
              )}
            </div>

            {/* BMI 표시 */}
            {((isEditing && editingBMI) || (!isEditing && currentBMI)) && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground min-w-[40px]">
                  BMI
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {isEditing ? editingBMI : currentBMI}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      getBMIStatus(isEditing ? editingBMI! : currentBMI!).color
                    }`}
                  >
                    {getBMIStatus(isEditing ? editingBMI! : currentBMI!).status}
                  </Badge>
                </div>
              </div>
            )}

            {/* 운전 여부 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground min-w-[40px]">
                운전
              </span>
              {isEditing ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.hasDrivingLicense}
                    onChange={(e) =>
                      onEditFormChange({ hasDrivingLicense: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">운전 가능</span>
                </label>
              ) : (
                <Badge
                  variant={client?.hasDrivingLicense ? 'default' : 'secondary'}
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

                    {/* 주민등록번호 분리 입력 */}
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <Input
                        type="text"
                        placeholder="YYMMDD"
                        value={editFormData.ssnFront}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6);
                          onSsnChange(value, editFormData.ssnBack);
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
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 7);
                          onSsnChange(editFormData.ssnFront, value);
                        }}
                        className="col-span-2 text-center font-mono"
                        maxLength={7}
                      />
                    </div>

                    {/* 입력 가이드 */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• 생년월일 6자리 (YYMMDD) + 개인식별번호 7자리</p>
                      <p>• 입력된 정보는 안전하게 저장됩니다</p>
                    </div>

                    {/* 에러 메시지 표시 */}
                    {editFormData.ssnError && (
                      <div className="mt-2 p-3 bg-red-50/70 border border-red-200/60 rounded-lg dark:bg-red-950/30 dark:border-red-800/50">
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 text-sm">⚠️</span>
                          <div className="text-xs text-red-800 dark:text-red-300">
                            {editFormData.ssnError}
                          </div>
                        </div>
                        {/* 예시 표시 */}
                        {(editFormData.ssnError.includes('77년생 남성') ||
                          editFormData.ssnError.includes('77년생 여성')) && (
                          <div className="mt-2 text-xs text-red-700 dark:text-red-400">
                            <div className="font-medium mb-1">올바른 예시:</div>
                            <div>
                              • 77년생 남성: 771111-
                              <span className="bg-green-100 dark:bg-green-900/50 px-1 rounded">
                                1
                              </span>
                              ●●●●●●
                            </div>
                            <div>
                              • 77년생 여성: 771111-
                              <span className="bg-green-100 dark:bg-green-900/50 px-1 rounded">
                                2
                              </span>
                              ●●●●●●
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 메모 섹션 */}
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">메모</h4>
            {isEditing ? (
              <Textarea
                value={editFormData.notes}
                onChange={(e) => onEditFormChange({ notes: e.target.value })}
                placeholder="고객에 대한 메모를 입력하세요..."
                className="min-h-[80px] text-sm resize-none"
              />
            ) : client?.notes ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {client.notes}
              </p>
            ) : (
              <p
                className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                onClick={onEditStart}
                title="클릭하여 입력"
              >
                메모를 추가하세요...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
