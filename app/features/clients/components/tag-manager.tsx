import { useState } from 'react';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Checkbox } from '~/common/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Cross2Icon,
  PlusIcon,
  LockClosedIcon,
  EyeOpenIcon,
  CircleIcon,
} from '@radix-ui/react-icons';

// 🔒 **태그 보안 레벨 정의**
type TagPrivacyLevel = 'public' | 'restricted' | 'private' | 'confidential';

interface SecureTag {
  id: string;
  text: string;
  privacyLevel: TagPrivacyLevel;
  createdAt: string;
  createdBy?: string;
  category?:
    | 'personal'
    | 'medical'
    | 'financial'
    | 'family'
    | 'business'
    | 'other';
  isEncrypted?: boolean;
}

interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  // 🔒 보안 강화 props
  enableSecurity?: boolean; // 보안 기능 활성화
  defaultPrivacyLevel?: TagPrivacyLevel; // 기본 개인정보 보호 레벨
  currentUserRole?: 'agent' | 'manager' | 'admin'; // 현재 사용자 권한
  onSecurityAudit?: (
    action: string,
    tag: string,
    level: TagPrivacyLevel
  ) => void;
  maxTags?: number; // 최대 태그 수 제한
  restrictedWords?: string[]; // 금지된 단어들
  suggestedTags?: string[]; // 추천 태그들
}

export function TagManager({
  tags,
  onTagsChange,
  placeholder = '새 태그 입력',
  label = '태그',
  enableSecurity = false,
  defaultPrivacyLevel = 'restricted',
  currentUserRole = 'agent',
  onSecurityAudit,
  maxTags = 20,
  restrictedWords = [],
  suggestedTags = [],
}: TagManagerProps) {
  const [newTag, setNewTag] = useState('');
  const [secureTags, setSecureTags] = useState<SecureTag[]>([]);
  const [showSecurityOptions, setShowSecurityOptions] = useState(false);
  const [newTagPrivacyLevel, setNewTagPrivacyLevel] =
    useState<TagPrivacyLevel>(defaultPrivacyLevel);
  const [newTagCategory, setNewTagCategory] = useState<string>('other');
  const [filterLevel, setFilterLevel] = useState<TagPrivacyLevel | 'all'>(
    'all'
  );

  // 🔒 **권한 확인**
  const hasAccessToLevel = (level: TagPrivacyLevel): boolean => {
    const roleHierarchy = {
      admin: ['public', 'restricted', 'private', 'confidential'],
      manager: ['public', 'restricted', 'private'],
      agent: ['public', 'restricted'],
    };
    return roleHierarchy[currentUserRole]?.includes(level) || false;
  };

  // 🔒 **보안 감사 로깅**
  const logSecurityAction = (
    action: string,
    tag: string,
    level: TagPrivacyLevel
  ) => {
    onSecurityAudit?.(action, tag, level);
    console.log(`🔒 태그 보안 감사: ${action} - ${tag} (${level})`);
  };

  // 🔒 **태그 유효성 검증**
  const validateTag = (tag: string): { isValid: boolean; reason?: string } => {
    if (!tag.trim()) return { isValid: false, reason: '태그가 비어있습니다' };
    if (tag.length > 50)
      return { isValid: false, reason: '태그가 너무 깁니다 (최대 50자)' };
    if (tags.includes(tag))
      return { isValid: false, reason: '이미 존재하는 태그입니다' };
    if (tags.length >= maxTags)
      return {
        isValid: false,
        reason: `최대 ${maxTags}개까지만 추가할 수 있습니다`,
      };

    // 금지된 단어 검사
    const hasRestrictedWord = restrictedWords.some(word =>
      tag.toLowerCase().includes(word.toLowerCase())
    );
    if (hasRestrictedWord)
      return {
        isValid: false,
        reason: '사용할 수 없는 단어가 포함되어 있습니다',
      };

    // 개인정보 패턴 검사
    const personalInfoPatterns = [
      /\d{3}-\d{4}-\d{4}/, // 전화번호
      /\d{6}-\d{7}/, // 주민등록번호
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // 이메일
    ];

    const hasPersonalInfo = personalInfoPatterns.some(pattern =>
      pattern.test(tag)
    );
    if (hasPersonalInfo)
      return {
        isValid: false,
        reason: '개인정보가 포함된 태그는 사용할 수 없습니다',
      };

    return { isValid: true };
  };

  // 태그 추가 (보안 강화)
  const addTag = () => {
    const validation = validateTag(newTag);
    if (!validation.isValid) {
      alert(validation.reason);
      return;
    }

    if (enableSecurity) {
      // 보안 모드: SecureTag 생성
      const secureTag: SecureTag = {
        id: Date.now().toString(),
        text: newTag,
        privacyLevel: newTagPrivacyLevel,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user-id', // 실제로는 현재 사용자 ID
        category: newTagCategory as any,
        isEncrypted: newTagPrivacyLevel === 'confidential',
      };

      setSecureTags([...secureTags, secureTag]);
      logSecurityAction('tag_added', newTag, newTagPrivacyLevel);
    }

    onTagsChange([...tags, newTag]);
    setNewTag('');
  };

  // 태그 제거 (보안 강화)
  const removeTag = (tagToRemove: string) => {
    if (enableSecurity) {
      const secureTag = secureTags.find(t => t.text === tagToRemove);
      if (secureTag && !hasAccessToLevel(secureTag.privacyLevel)) {
        alert('이 태그를 삭제할 권한이 없습니다.');
        return;
      }

      setSecureTags(secureTags.filter(t => t.text !== tagToRemove));
      logSecurityAction(
        'tag_removed',
        tagToRemove,
        secureTag?.privacyLevel || 'public'
      );
    }

    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  // 🔒 **추천 태그 추가**
  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
      if (enableSecurity) {
        logSecurityAction('suggested_tag_added', tag, defaultPrivacyLevel);
      }
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // 🔒 **태그 필터링 (보안 레벨별)**
  const getFilteredTags = () => {
    if (!enableSecurity || filterLevel === 'all') return tags;

    return tags.filter(tag => {
      const secureTag = secureTags.find(st => st.text === tag);
      return (
        secureTag?.privacyLevel === filterLevel &&
        hasAccessToLevel(secureTag.privacyLevel)
      );
    });
  };

  // 🔒 **태그 보안 레벨 배지**
  const getSecurityBadge = (tag: string) => {
    if (!enableSecurity) return null;

    const secureTag = secureTags.find(st => st.text === tag);
    if (!secureTag) return null;

    const badges = {
      public: <span className="text-green-600 text-xs">🌐</span>,
      restricted: <span className="text-yellow-600 text-xs">🔒</span>,
      private: <span className="text-orange-600 text-xs">🔐</span>,
      confidential: <span className="text-red-600 text-xs">🚫</span>,
    };

    return badges[secureTag.privacyLevel];
  };

  // 🔒 **태그 카테고리 배지**
  const getCategoryBadge = (tag: string) => {
    if (!enableSecurity) return null;

    const secureTag = secureTags.find(st => st.text === tag);
    if (!secureTag?.category || secureTag.category === 'other') return null;

    const categoryIcons = {
      personal: '👤',
      medical: '🏥',
      financial: '💰',
      family: '👨‍👩‍👧‍👦',
      business: '💼',
    };

    return <span className="text-xs">{categoryIcons[secureTag.category]}</span>;
  };

  const filteredTags = getFilteredTags();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          {label}
          {enableSecurity && (
            <Badge variant="outline" className="text-xs">
              <LockClosedIcon className="h-3 w-3 mr-1" />
              보안 모드
            </Badge>
          )}
        </Label>

        {enableSecurity && (
          <div className="flex items-center gap-2">
            <Select
              value={filterLevel}
              onValueChange={(value: TagPrivacyLevel | 'all') =>
                setFilterLevel(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="public">공개</SelectItem>
                <SelectItem value="restricted">제한</SelectItem>
                {hasAccessToLevel('private') && (
                  <SelectItem value="private">비공개</SelectItem>
                )}
                {hasAccessToLevel('confidential') && (
                  <SelectItem value="confidential">기밀</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSecurityOptions(!showSecurityOptions)}
            >
              <EyeOpenIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 🔒 보안 옵션 패널 */}
      {enableSecurity && showSecurityOptions && (
        <div className="bg-slate-50 p-3 rounded-lg border space-y-3">
          <h4 className="text-sm font-medium">보안 설정</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">개인정보 보호 레벨</Label>
              <Select
                value={newTagPrivacyLevel}
                onValueChange={(value: TagPrivacyLevel) =>
                  setNewTagPrivacyLevel(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">공개</SelectItem>
                  <SelectItem value="restricted">제한</SelectItem>
                  {hasAccessToLevel('private') && (
                    <SelectItem value="private">비공개</SelectItem>
                  )}
                  {hasAccessToLevel('confidential') && (
                    <SelectItem value="confidential">기밀</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">카테고리</Label>
              <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">개인정보</SelectItem>
                  <SelectItem value="medical">의료정보</SelectItem>
                  <SelectItem value="financial">금융정보</SelectItem>
                  <SelectItem value="family">가족정보</SelectItem>
                  <SelectItem value="business">업무정보</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            현재 권한: <strong>{currentUserRole}</strong> | 태그 수:{' '}
            <strong>
              {tags.length}/{maxTags}
            </strong>
          </div>
        </div>
      )}

      {/* 기존 태그 표시 */}
      <div className="flex flex-wrap gap-2 mb-2">
        {filteredTags.map((tag, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="gap-1 cursor-pointer">
                  {getSecurityBadge(tag)}
                  {getCategoryBadge(tag)}
                  <span
                    className={
                      enableSecurity &&
                      secureTags.find(st => st.text === tag)?.isEncrypted
                        ? 'blur-sm hover:blur-none'
                        : ''
                    }
                  >
                    {tag}
                  </span>
                  <Cross2Icon
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {enableSecurity && (
                  <div className="text-xs">
                    <div>
                      레벨:{' '}
                      {secureTags.find(st => st.text === tag)?.privacyLevel ||
                        'public'}
                    </div>
                    <div>
                      카테고리:{' '}
                      {secureTags.find(st => st.text === tag)?.category ||
                        'other'}
                    </div>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* 새 태그 입력 */}
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          className="max-w-xs"
          maxLength={50}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!newTag || tags.includes(newTag) || tags.length >= maxTags}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* 🔒 추천 태그 */}
      {suggestedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">추천 태그</Label>
          <div className="flex flex-wrap gap-1">
            {suggestedTags
              .filter(tag => !tags.includes(tag))
              .slice(0, 10)
              .map((tag, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => addSuggestedTag(tag)}
                >
                  + {tag}
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* 🔒 보안 경고 */}
      {enableSecurity && tags.length > maxTags * 0.8 && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <CircleIcon className="h-4 w-4" />
          태그 수가 제한({maxTags}개)에 가까워지고 있습니다.
        </div>
      )}
    </div>
  );
}
