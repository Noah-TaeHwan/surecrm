# 📅 구글 캘린더 연동 기획서

## SureCRM MVP 구글 캘린더 통합 전략

---

## 🎯 **프로젝트 개요**

### **핵심 전략**

**"SureCRM 고유의 룩앤필/톤앤매너를 유지하는 커스터마이즈 UI + 구글 캘린더 API 데이터 활용"**

- ✨ **UI/UX**: SureCRM만의 브랜딩과 디자인 시스템 완전 유지
- 🔗 **데이터**: 구글 캘린더 API를 통한 이벤트 데이터 통합
- 🎨 **사용자 경험**: 일관된 SureCRM 인터페이스 내에서 모든 캘린더 데이터 통합 관리

### **목표**

보험설계사들이 **SureCRM의 일관된 UI 경험** 안에서 구글 캘린더 데이터를 자연스럽게 활용하여 고객 미팅과 일정을 통합 관리할 수 있는 MVP 수준의 연동 기능 구현

### **사용자 피드백 기반 니즈**

- **"엄청난 캘린더 기능보다는 구글 캘린더 연동이 핵심"**
- **기존 구글 캘린더 데이터를 SureCRM UI에서 활용**
- **SureCRM의 통일된 톤앤매너 유지하면서 데이터 통합**

### **MVP 철학**

복잡한 캘린더 시스템을 새로 만들거나 구글 UI를 임베드하기보다는, **SureCRM 고유의 세련된 UI 안에서 구글 캘린더 데이터를 완벽하게 활용**하는 데 집중

---

## 🎨 **UI/UX 전략: "One UI, All Data"**

### **디자인 철학**

#### **1. SureCRM 브랜딩 유지**

```typescript
// SureCRM 고유 디자인 요소 활용
const calendarTheme = {
  primary: 'var(--primary)', // SureCRM 브랜드 컬러
  secondary: 'var(--secondary)',
  accent: 'var(--accent)',
  googleEventGradient: 'from-blue-500 to-blue-600', // 구글 이벤트 구분
  surecrmEventGradient: 'from-primary to-primary/80', // SureCRM 이벤트
  meetingTypeColors: {
    consultation: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    followUp: 'bg-gradient-to-r from-blue-500 to-blue-600',
    google: 'bg-gradient-to-r from-orange-500 to-orange-600', // 구글 전용
  },
};
```

#### **2. 시각적 데이터 통합**

- **이벤트 소스 구분**: 미묘한 아이콘과 색상으로 구분
- **일관된 타이포그래피**: SureCRM 폰트 시스템 유지
- **통합된 인터랙션**: SureCRM 표준 버튼, 모달, 드롭다운 사용

### **커스터마이즈 UI 컴포넌트**

#### **CalendarGrid 컴포넌트 고도화**

```typescript
interface EnhancedCalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  source: 'surecrm' | 'google' | 'outlook'; // 데이터 출처
  sourceIcon: string; // 📋 📅 📧
  meetingType?: 'consultation' | 'followUp' | 'google';
  client?: Client; // SureCRM 고객 연결
  googleEventId?: string; // 구글 이벤트 ID
  syncStatus: 'synced' | 'pending' | 'conflict'; // 동기화 상태
}
```

#### **이벤트 표시 전략**

```tsx
// SureCRM 스타일 이벤트 카드
<div
  className={`
  event-card
  ${
    event.source === 'google'
      ? 'border-l-4 border-blue-500'
      : 'border-l-4 border-primary'
  }
  ${meetingTypeColors[event.meetingType]}
  rounded-lg shadow-sm hover:shadow-md transition-all
`}
>
  <div className="flex items-center gap-2">
    <span className="text-sm">{event.sourceIcon}</span>
    <h3 className="font-medium text-white">{event.title}</h3>
    {event.syncStatus === 'pending' && (
      <Loader2 className="h-3 w-3 animate-spin" />
    )}
  </div>
</div>
```

---

## 🔍 **현재 상태 분석**

### ✅ **이미 구축된 부분**

1. **데이터베이스 스키마**: 구글 캘린더 연동을 위한 모든 테이블 구조 완성

   - `app_calendar_settings`: OAuth 토큰, 동기화 상태 관리
   - `app_calendar_sync_logs`: 양방향 동기화 로그 추적
   - `appCalendarExternalSourceEnum`: google_calendar 지원

2. **UI 구조**: 기본 캘린더 페이지 및 컴포넌트 완성

   - 월/주/일 뷰 지원
   - 미팅 생성/수정/삭제 기능
   - 동기화 상태 표시 준비됨

3. **비즈니스 로직**: 미팅 관리 및 데이터 처리 로직 구현

### ⚠️ **구현 필요 부분**

1. **OAuth 2.0 인증**: 구글 캘린더 접근 권한 획득
2. **양방향 동기화**: 구글 ↔ SureCRM 실시간 동기화
3. **충돌 해결**: 동시 수정 시 데이터 충돌 처리
4. **사용자 설정**: 동기화 옵션 및 환경설정

---

## 🏗️ **구현 전략: 큰 그림**

### **Phase 1: UI 기반 완성 (1주)**

**목표**: SureCRM 디자인 시스템 내에서 구글 이벤트 표시 완벽 구현

**세부 작업**:

1. **이벤트 타입 확장**: Google 이벤트 지원 타입 추가
2. **시각적 구분**: 구글/SureCRM 이벤트 시각적 차별화
3. **동기화 상태 UI**: 실시간 동기화 상태 표시
4. **설정 페이지**: 구글 캘린더 연동 설정 UI

### **Phase 2: 데이터 연동 구현 (2주)**

**목표**: 구글 캘린더 API 연동 및 데이터 양방향 동기화

**세부 작업**:

1. **OAuth 2.0 인증**: 구글 계정 연동
2. **Read API**: 구글 캘린더 이벤트 조회
3. **Write API**: SureCRM → 구글 이벤트 생성
4. **실시간 동기화**: 웹훅 기반 양방향 동기화

### **Phase 3: 고급 기능 (1주)**

**목표**: 충돌 해결, 성능 최적화, 사용자 경험 완성

**세부 작업**:

1. **충돌 해결 UI**: 동기화 충돌 시 사용자 선택 인터페이스
2. **성능 최적화**: 배치 동기화, 캐싱 전략
3. **오류 처리**: 우아한 오류 상황 처리

---

## 📋 **세부 실행 계획**

### **🎯 Phase 1: UI 기반 완성 (1주)**

#### **Day 1-2: 타입 시스템 확장**

```typescript
// 1. Enhanced Meeting Type
interface GoogleCalendarEvent extends Meeting {
  googleEventId: string;
  sourceIcon: '📅' | '📋' | '📧';
  syncStatus: 'synced' | 'pending' | 'conflict' | 'failed';
  lastSyncAt?: Date;
  conflictData?: {
    googleVersion: Partial<Meeting>;
    localVersion: Partial<Meeting>;
    conflictFields: string[];
  };
}

// 2. Calendar Settings Enhancement
interface CalendarSettings {
  agentId: string;
  googleCalendarSync: boolean;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  syncDirection: 'read_only' | 'write_only' | 'bidirectional';
  conflictResolution: 'google_wins' | 'local_wins' | 'manual';
  autoSyncInterval: number; // minutes
}
```

#### **Day 3-4: 시각적 컴포넌트 구현**

```tsx
// EventCard 컴포넌트 고도화
function EventCard({ event }: { event: GoogleCalendarEvent }) {
  const sourceStyles = {
    surecrm: {
      icon: '📋',
      gradient: 'from-primary to-primary/80',
      border: 'border-primary/20',
    },
    google: {
      icon: '📅',
      gradient: 'from-blue-500 to-blue-600',
      border: 'border-blue-500/20',
    },
    outlook: {
      icon: '📧',
      gradient: 'from-orange-500 to-orange-600',
      border: 'border-orange-500/20',
    },
  };

  const style = sourceStyles[event.source];

  return (
    <Card
      className={`${style.border} hover:shadow-md transition-all duration-200`}
    >
      <CardContent
        className={`p-3 bg-gradient-to-r ${style.gradient} text-white rounded-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{style.icon}</span>
            <h3 className="font-medium">{event.title}</h3>
          </div>
          <SyncStatusIndicator status={event.syncStatus} />
        </div>
        {event.client && (
          <p className="text-xs text-white/80 mt-1">
            고객: {event.client.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// 동기화 상태 표시기
function SyncStatusIndicator({ status }: { status: string }) {
  const indicators = {
    synced: <CheckCircle className="h-4 w-4 text-green-300" />,
    pending: <Loader2 className="h-4 w-4 animate-spin text-yellow-300" />,
    conflict: <AlertTriangle className="h-4 w-4 text-red-300" />,
    failed: <XCircle className="h-4 w-4 text-red-400" />,
  };

  return indicators[status] || null;
}
```

#### **Day 5-7: 설정 페이지 UI**

```tsx
// 구글 캘린더 연동 설정 섹션
function GoogleCalendarSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📅 구글 캘린더 연동
        </CardTitle>
        <CardDescription>
          구글 캘린더와 SureCRM을 연동하여 일정을 통합 관리하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="google-sync">구글 캘린더 동기화</Label>
          <Switch id="google-sync" />
        </div>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="동기화 방향 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read_only">
              구글 → SureCRM (읽기 전용)
            </SelectItem>
            <SelectItem value="write_only">
              SureCRM → 구글 (쓰기 전용)
            </SelectItem>
            <SelectItem value="bidirectional">양방향 동기화</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <Label>충돌 해결 방식</Label>
          <RadioGroup defaultValue="manual">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="google_wins" id="google_wins" />
              <Label htmlFor="google_wins">구글 캘린더 우선</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="local_wins" id="local_wins" />
              <Label htmlFor="local_wins">SureCRM 우선</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual">수동 선택</Label>
            </div>
          </RadioGroup>
        </div>

        <Button className="w-full">
          <Calendar className="h-4 w-4 mr-2" />
          구글 계정 연결
        </Button>
      </CardContent>
    </Card>
  );
}
```

### **🔗 Phase 2: 데이터 연동 구현 (2주)**

#### **Week 1: OAuth 및 Read API**

```typescript
// Google Calendar API 클라이언트
export class GoogleCalendarService {
  private auth: OAuth2Client;

  constructor() {
    this.auth = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // 1. 인증 URL 생성
  getAuthUrl(agentId: string): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      state: agentId, // 상태로 사용자 ID 전달
      prompt: 'consent', // 항상 refresh token 받기
    });
  }

  // 2. 토큰 교환 및 저장
  async handleOAuthCallback(code: string, agentId: string) {
    const { tokens } = await this.auth.getToken(code);

    await db
      .update(appCalendarSettings)
      .set({
        googleAccessToken: await encrypt(tokens.access_token),
        googleRefreshToken: await encrypt(tokens.refresh_token),
        googleCalendarSync: true,
        lastSyncAt: new Date(),
      })
      .where(eq(appCalendarSettings.agentId, agentId));

    return tokens;
  }

  // 3. 구글 이벤트 조회
  async fetchEvents(agentId: string, startTime: Date, endTime: Date) {
    const settings = await this.getCalendarSettings(agentId);
    if (!settings.googleCalendarSync) return [];

    this.auth.setCredentials({
      access_token: await decrypt(settings.googleAccessToken),
      refresh_token: await decrypt(settings.googleRefreshToken),
    });

    const calendar = google.calendar({ version: 'v3', auth: this.auth });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items?.map(this.convertGoogleEventToMeeting) || [];
  }

  // 4. 구글 이벤트 → SureCRM Meeting 변환
  private convertGoogleEventToMeeting(
    googleEvent: calendar_v3.Schema$Event
  ): GoogleCalendarEvent {
    return {
      id: generateId(),
      googleEventId: googleEvent.id!,
      title: googleEvent.summary || '제목 없음',
      description: googleEvent.description || '',
      startTime: new Date(
        googleEvent.start?.dateTime || googleEvent.start?.date!
      ),
      endTime: new Date(googleEvent.end?.dateTime || googleEvent.end?.date!),
      source: 'google',
      sourceIcon: '📅',
      meetingType: 'google',
      syncStatus: 'synced',
      lastSyncAt: new Date(),
      agentId: '', // 나중에 설정
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
```

#### **Week 2: Write API 및 양방향 동기화**

```typescript
// 양방향 동기화 엔진
export class CalendarSyncEngine {
  private googleService: GoogleCalendarService;

  constructor() {
    this.googleService = new GoogleCalendarService();
  }

  // SureCRM Meeting → Google Event 생성
  async syncMeetingToGoogle(meeting: Meeting) {
    try {
      const googleEvent = await this.googleService.createEvent(
        meeting.agentId,
        {
          summary: meeting.title,
          description: meeting.description,
          start: {
            dateTime: meeting.startTime.toISOString(),
            timeZone: 'Asia/Seoul',
          },
          end: {
            dateTime: meeting.endTime.toISOString(),
            timeZone: 'Asia/Seoul',
          },
        }
      );

      // SureCRM Meeting 업데이트 (구글 ID 저장)
      await db
        .update(appCalendarMeetings)
        .set({
          googleEventId: googleEvent.id,
          syncStatus: 'synced',
          lastSyncAt: new Date(),
        })
        .where(eq(appCalendarMeetings.id, meeting.id));

      await this.logSync(meeting.id, 'to_google', 'success');
    } catch (error) {
      await this.logSync(meeting.id, 'to_google', 'failed', error.message);
      throw error;
    }
  }

  // 전체 양방향 동기화 실행
  async performFullSync(agentId: string) {
    const lastSync = await this.getLastSyncTime(agentId);

    // 1. Google → SureCRM
    await this.syncFromGoogle(agentId, lastSync);

    // 2. SureCRM → Google
    await this.syncToGoogle(agentId, lastSync);

    // 3. 충돌 감지
    const conflicts = await this.detectConflicts(agentId);
    if (conflicts.length > 0) {
      await this.notifyConflicts(agentId, conflicts);
    }

    await this.updateLastSyncTime(agentId);
  }

  // 웹훅으로 실시간 동기화
  async handleGoogleWebhook(channelId: string) {
    const agentId = channelId.replace('surecrm-', '');

    // 5초 후 동기화 (중복 웹훅 방지)
    setTimeout(async () => {
      await this.performFullSync(agentId);
    }, 5000);
  }
}
```

### **⚡ Phase 3: 고급 기능 (1주)**

#### **충돌 해결 UI**

```tsx
function ConflictResolutionModal({ conflicts }: { conflicts: ConflictData[] }) {
  return (
    <Dialog>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>일정 동기화 충돌 감지</DialogTitle>
          <DialogDescription>
            다음 일정들이 동시에 수정되어 충돌이 발생했습니다. 어떤 버전을
            유지할지 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        {conflicts.map((conflict) => (
          <Card key={conflict.eventId} className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">{conflict.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    📋 SureCRM 버전
                  </Label>
                  <div className="p-3 bg-primary/5 rounded border">
                    <p>
                      <strong>시간:</strong>{' '}
                      {formatDate(conflict.localVersion.startTime)}
                    </p>
                    <p>
                      <strong>제목:</strong> {conflict.localVersion.title}
                    </p>
                    <p>
                      <strong>설명:</strong> {conflict.localVersion.description}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    SureCRM 버전 선택
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    📅 구글 캘린더 버전
                  </Label>
                  <div className="p-3 bg-blue-50 rounded border">
                    <p>
                      <strong>시간:</strong>{' '}
                      {formatDate(conflict.googleVersion.startTime)}
                    </p>
                    <p>
                      <strong>제목:</strong> {conflict.googleVersion.title}
                    </p>
                    <p>
                      <strong>설명:</strong>{' '}
                      {conflict.googleVersion.description}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    구글 버전 선택
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📊 **진행상황 추적 체계**

### **일일 체크포인트**

- [ ] **UI 컴포넌트**: 이벤트 표시, 상태 표시기, 설정 페이지
- [ ] **API 연동**: OAuth, Read/Write API, 웹훅
- [ ] **동기화 로직**: 양방향 동기화, 충돌 해결
- [ ] **테스트**: 단위 테스트, 통합 테스트, 사용자 테스트

### **주간 마일스톤**

- **Week 1**: UI 완성 ✅ SureCRM 디자인 시스템 내 구글 이벤트 표시
- **Week 2**: 읽기 연동 ✅ 구글 캘린더 → SureCRM 데이터 조회
- **Week 3**: 쓰기 연동 ✅ SureCRM → 구글 캘린더 이벤트 생성
- **Week 4**: 완성도 ✅ 실시간 동기화, 충돌 해결, 성능 최적화

### **성공 지표**

- **기능**: 동기화 성공률 95% 이상, 지연시간 30초 이내
- **사용성**: 설정 완료율 80% 이상, 일일 동기화 5회 이상
- **안정성**: 오류율 1% 미만, 충돌 자동해결 90% 이상

---

## 🎯 **결론: "One UI, All Data" 전략의 완성**

SureCRM의 구글 캘린더 연동은 **"SureCRM의 세련된 UI/UX 경험을 유지하면서 구글 캘린더의 풍부한 데이터를 완벽하게 활용"**하는 것을 목표로 합니다.

이를 통해 사용자는:

- ✨ **일관된 브랜드 경험**: SureCRM의 톤앤매너 유지
- 🔗 **완벽한 데이터 통합**: 구글 캘린더 데이터 자연스러운 활용
- 🎯 **효율적인 워크플로우**: 하나의 인터페이스에서 모든 일정 관리

MVP 완성 후 SureCRM은 보험설계사를 위한 **궁극의 업무 허브**로 자리잡을 것입니다.
