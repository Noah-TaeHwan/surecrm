import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Badge } from '~/common/components/ui/badge';
import { Label } from '~/common/components/ui/label';
import { CheckIcon, Pencil1Icon, PersonIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Form, useSubmit } from 'react-router';
import type { ProfileSectionProps } from '../types';

export function ProfileSection({ profile, onUpdate }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🕐 시간 포맷팅 함수 (suppressHydrationWarning 사용)
  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return '미설정';
    return new Date(dateString).toLocaleString('ko-KR');
  };
  const submit = useSubmit();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.append('intent', 'updateProfile');

    submit(formData, { method: 'POST' });

    // 제출 후 상태 리셋은 부모 컴포넌트의 actionData로 처리
    setTimeout(() => {
      setIsEditing(false);
      setIsSubmitting(false);
    }, 2000); // 2초 후 자동으로 편집 모드 해제
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // 프로필 완성도 계산
  const calculateProfileCompletion = () => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.company,
    ];
    const filledFields = fields.filter(
      field => field && field.trim() !== ''
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              👤 프로필 정보
              <Badge
                variant={profileCompletion === 100 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {profileCompletion}% 완성
              </Badge>
            </CardTitle>
            <CardDescription>
              기본 프로필 정보를 관리하세요. 완성도가 높을수록 더 나은 서비스를
              받을 수 있습니다.
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? 'outline' : 'default'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSubmitting}
          >
            {isEditing ? (
              <>취소</>
            ) : (
              <>
                <Pencil1Icon className="mr-2 h-4 w-4" />
                편집
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 프로필 사진 및 기본 정보 */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-primary/10">
              {profile.name?.[0] || '사'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h3 className="font-medium text-lg">
              {profile.name || '이름 없음'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile.position || '보험설계사'}
            </p>
            {profile.team && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <PersonIcon className="h-3 w-3" />
                  {profile.team.name}
                </Badge>
              </div>
            )}
            {profile.company && (
              <p className="text-sm text-muted-foreground">
                📍 {profile.company}
              </p>
            )}
            {profile.lastLoginAt && (
              <p className="text-sm text-muted-foreground">
                🕐 마지막 로그인:{' '}
                <span suppressHydrationWarning>
                  {formatLastLogin(profile.lastLoginAt)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* 프로필 폼 */}
        <Form method="post" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  이름 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={profile.name}
                  disabled={!isEditing}
                  required
                  placeholder="홍길동"
                  className={!profile.name ? 'border-orange-200' : ''}
                />
                {!profile.name && !isEditing && (
                  <p className="text-xs text-orange-600">이름을 입력해주세요</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={profile.email}
                  disabled={true}
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  🔒 이메일은 보안상 변경할 수 없습니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  전화번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile.phone}
                  disabled={!isEditing}
                  placeholder="010-1234-5678"
                  className={!profile.phone ? 'border-orange-200' : ''}
                />
                {!profile.phone && !isEditing && (
                  <p className="text-xs text-orange-600">
                    전화번호를 입력해주세요
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-1">
                  소속 보험사 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={profile.company}
                  disabled={!isEditing}
                  placeholder="삼성화재, KB손해보험, 현대해상 등"
                  className={!profile.company ? 'border-orange-200' : ''}
                />
                {!profile.company && !isEditing && (
                  <p className="text-xs text-orange-600">
                    소속 보험사를 입력해주세요
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">직책/등급</Label>
                <Input
                  id="position"
                  name="position"
                  defaultValue={profile.position}
                  disabled={!isEditing}
                  placeholder="FC, 팀장, 지점장, 본부장 등"
                />
                <p className="text-xs text-muted-foreground">
                  💡 직책에 따라 맞춤형 기능이 제공됩니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">소속 팀/지점</Label>
                <Input
                  id="team"
                  name="team"
                  defaultValue={profile.team?.name || ''}
                  disabled={!isEditing}
                  placeholder="강남지점, 영업1팀 등"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      저장
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Form>

        {/* 프로필 완성도 안내 */}
        {profileCompletion < 100 && !isEditing && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md">
            <p className="text-sm text-orange-800 dark:text-orange-400">
              💡 프로필을 완성하면 더 정확한 맞춤 서비스를 받을 수 있습니다.
              현재 {4 - Math.floor(profileCompletion / 25)}개 필드가
              비어있습니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
