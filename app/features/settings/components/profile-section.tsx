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
import type { ProfileSectionProps } from './types';

export function ProfileSection({ profile, onUpdate }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const submit = useSubmit();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('intent', 'updateProfile');
    submit(formData, { method: 'POST' });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>프로필 정보</CardTitle>
            <CardDescription>기본 프로필 정보를 관리하세요</CardDescription>
          </div>
          <Button
            variant={isEditing ? 'outline' : 'default'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
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
        {/* 프로필 사진 */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {profile.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-medium">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.position}</p>
            {profile.team && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <PersonIcon className="h-3 w-3" />
                  {profile.team.name}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* 프로필 폼 */}
        <Form method="post" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={profile.name}
                  disabled={!isEditing}
                  required
                />
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
                  이메일은 변경할 수 없습니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile.phone}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">회사</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={profile.company}
                  disabled={!isEditing}
                  placeholder="소속 보험사"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">직책</Label>
                <Input
                  id="position"
                  name="position"
                  defaultValue={profile.position}
                  disabled={true}
                  className="opacity-60"
                  placeholder="영업팀장, 설계사 등"
                />
                <p className="text-xs text-muted-foreground">
                  직책은 자동으로 설정됩니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">소속 팀</Label>
                <Input
                  id="team"
                  name="team"
                  defaultValue={profile.team?.name || ''}
                  disabled={!isEditing}
                  placeholder="팀 이름을 입력하세요"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  취소
                </Button>
                <Button type="submit">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            )}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
