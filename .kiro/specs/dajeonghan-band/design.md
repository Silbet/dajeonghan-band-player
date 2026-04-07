# 기술 설계 문서: 다정한 밴드

## 개요

"다정한 밴드"는 밴드 합주 녹음을 웹에서 공유하고 재생하는 정적 웹 서비스입니다.
별도 로그인 없이 URL 접근만으로 누구나 이용 가능하며, 상단 고정 플레이어 + 하단 곡 목록 레이아웃으로 스포티파이/유튜브뮤직 스타일의 다크톤 UI를 제공합니다.

### 기술 스택

- 프론트엔드: React (Vite)
- 스타일링: Tailwind CSS
- 상태관리: React useState / useReducer + Context API
- 백엔드: 없음 (프론트엔드 전용)
- DB/Storage: Supabase (PostgreSQL + Storage)
- 호스팅: Vercel
- 커버이미지: iTunes Search API (곡 추가 시 1회 검색 후 DB에 URL 저장)

---

## 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────┐
│                  Vercel CDN                  │
│  ┌───────────────────────────────────────┐  │
│  │           React SPA (Vite)            │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   PlayerContext (전역 상태)      │  │  │
│  │  │  - currentTrack                 │  │  │
│  │  │  - queue / shuffleQueue         │  │  │
│  │  │  - isPlaying / autoplay         │  │  │
│  │  │  - shuffle / sortOrder          │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ┌──────────────┐ ┌────────────────┐  │  │
│  │  │FixedPlayer   │ │  TrackList     │  │  │
│  │  │(상단 고정)    │ │  (하단 목록)   │  │  │
│  │  └──────────────┘ └────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
  ┌─────────────┐        ┌──────────────────┐
  │  Supabase   │        │  iTunes Search   │
  │  DB + Storage│       │  API (곡 추가 시) │
  └─────────────┘        └──────────────────┘
```

### 데이터 흐름

1. 앱 초기화 시 Supabase DB에서 전체 트랙 목록 조회
2. 트랙 데이터를 PlayerContext에 저장, 기본 Queue 생성 (최신순)
3. 사용자 인터랙션은 PlayerContext의 dispatch를 통해 상태 변경
4. HTML5 Audio 엘리먼트는 PlayerContext가 직접 관리
5. 커버 이미지는 DB에 저장된 URL을 그대로 사용 (방문 시 iTunes API 호출 없음)

---

## 컴포넌트 및 인터페이스

### 컴포넌트 트리

```
App
├── PlayerContext.Provider
│   ├── FixedPlayer
│   │   ├── TrackInfo (커버이미지, 제목, 아티스트, 앨범, 멤버, 날짜)
│   │   ├── Controls (이전/재생-일시정지/다음)
│   │   ├── SeekBar (시크바 + 시간 표시)
│   │   └── ToggleButtons (자동재생, 셔플)
│   └── TrackList
│       ├── SortToggle (최신순/오래된순)
│       └── TrackItem[] (곡 항목, 펼치기/접기 포함)
```

### PlayerContext 인터페이스

```typescript
interface PlayerState {
  tracks: Track[];           // DB에서 로드한 전체 트랙
  queue: Track[];            // 현재 재생 큐 (정렬 순서 반영)
  currentIndex: number;      // queue 내 현재 인덱스
  isPlaying: boolean;
  autoplay: boolean;         // 기본값: true
  shuffle: boolean;          // 기본값: false
  sortOrder: 'desc' | 'asc'; // 기본값: 'desc' (최신순)
  currentTime: number;       // 초 단위
  duration: number;          // 초 단위
  isLoading: boolean;
  error: string | null;
}

type PlayerAction =
  | { type: 'LOAD_TRACKS'; payload: Track[] }
  | { type: 'SELECT_TRACK'; payload: number }   // queue 인덱스
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SEEK'; payload: number }           // 초 단위
  | { type: 'TOGGLE_AUTOPLAY' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_SORT' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_ERROR'; payload: string };
```

### 컴포넌트별 Props

```typescript
// FixedPlayer: PlayerContext를 직접 소비, props 없음

// TrackItem
interface TrackItemProps {
  track: Track;
  isActive: boolean;       // 현재 재생 중 여부
  onSelect: () => void;    // 클릭 시 재생
}

// SeekBar
interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}
```

---

## 데이터 모델

### Supabase DB 스키마

#### `tracks` 테이블

```sql
CREATE TABLE tracks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  artist        TEXT NOT NULL,          -- 원곡 아티스트
  album         TEXT NOT NULL,          -- 앨범명
  duration      INTEGER NOT NULL,       -- 재생시간 (초)
  recorded_at   DATE NOT NULL,          -- 녹음 날짜
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  audio_url     TEXT NOT NULL,          -- Supabase Storage MP3 URL
  cover_url     TEXT,                   -- iTunes 또는 수동 업로드 커버 URL
  members       JSONB NOT NULL          -- [{"name": "홍길동", "part": "기타"}]
);
```

#### Row Level Security

```sql
-- 읽기 전용 공개 접근 (인증 불필요)
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON tracks FOR SELECT USING (true);
```

### 프론트엔드 타입

```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;        // 초
  recordedAt: string;      // ISO date string
  uploadedAt: string;      // ISO timestamp string
  audioUrl: string;
  coverUrl: string | null;
  members: Member[];
}

interface Member {
  name: string;
  part: string;
}
```

### 셔플 알고리즘

Fisher-Yates 알고리즘으로 전체 큐를 미리 섞습니다.

```typescript
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

셔플 ON 전환 시: 전체 트랙을 섞어 Shuffle_Queue 생성
셔플 OFF 전환 시: 원래 날짜순 Queue로 복귀, 현재 곡 이후부터 재생
Shuffle_Queue 소진 시: 다시 섞어 새 Shuffle_Queue 생성 후 처음부터 재생

---

## 정확성 속성 (Correctness Properties)

*속성(Property)이란 시스템의 모든 유효한 실행에서 참이어야 하는 특성 또는 동작입니다. 즉, 시스템이 무엇을 해야 하는지에 대한 형식적 명세입니다. 속성은 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 합니다.*


### 속성 1: 트랙 데이터 표시 완전성

*임의의* Track 객체에 대해, TrackItem 및 FixedPlayer 렌더링 결과는 제목, 원곡 아티스트, 앨범명, 재생시간, 커버이미지 URL, 참여멤버(이름+파트), 녹음 날짜를 모두 포함해야 한다.

**검증 대상: 요구사항 1.1, 2.2, 2.3, 6.1, 6.2**

---

### 속성 2: 초기 상태 불변성

*임의의* 트랙 목록으로 앱을 초기화했을 때, 각 TrackItem의 expanded 상태는 false이고, autoplay는 true이며, shuffle은 false여야 한다.

**검증 대상: 요구사항 1.2, 3.1, 4.1**

---

### 속성 3: 펼치기/접기 토글

*임의의* TrackItem에 대해, 클릭 이벤트를 발생시키면 expanded 상태가 반전(toggle)되어야 한다. 두 번 클릭하면 원래 상태로 돌아와야 한다.

**검증 대상: 요구사항 1.3**

---

### 속성 4: 정렬 순서 라운드트립

*임의의* 트랙 목록에 대해, 정렬 토글을 두 번 클릭하면 원래 정렬 순서로 돌아와야 한다. 또한 초기 정렬은 항상 내림차순(최신순)이어야 한다.

**검증 대상: 요구사항 1.4, 1.5**

---

### 속성 5: 활성 트랙 하이라이트 유일성

*임의의* 트랙 목록에서 하나의 트랙을 선택하면, 해당 트랙만 isActive가 true이고 나머지 모든 트랙은 isActive가 false여야 한다. 또한 currentTrack이 선택한 트랙과 동일해야 한다.

**검증 대상: 요구사항 1.6, 1.7**

---

### 속성 6: 시크바 seek 정확성

*임의의* 유효한 시간 값(0 이상 duration 이하)으로 seek를 호출하면, currentTime이 해당 값으로 변경되어야 한다.

**검증 대상: 요구사항 2.6**

---

### 속성 7: 이전/다음 큐 탐색

*임의의* 큐와 현재 인덱스에 대해, 다음 버튼 클릭 시 인덱스가 1 증가하고, 이전 버튼 클릭 시 인덱스가 1 감소해야 한다. 단, 큐의 경계(첫 번째/마지막)에서는 각각 마지막/첫 번째 트랙으로 이동해야 한다.

**검증 대상: 요구사항 2.7, 2.8**

---

### 속성 8: 자동재생 상태에 따른 곡 종료 동작

*임의의* 큐에서 곡 종료 이벤트가 발생했을 때, autoplay가 true이면 다음 곡으로 이동하고 isPlaying이 true여야 하며, autoplay가 false이면 currentIndex가 변경되지 않고 isPlaying이 false여야 한다.

**검증 대상: 요구사항 3.2, 3.3**

---

### 속성 9: 자동재생 토글 라운드트립

*임의의* autoplay 상태에서 토글을 두 번 클릭하면 원래 상태로 돌아와야 한다.

**검증 대상: 요구사항 3.4**

---

### 속성 10: 셔플 큐 불변성

*임의의* 트랙 목록에 대해 셔플 큐를 생성하면, 생성된 큐는 원본 트랙 목록과 동일한 요소를 포함해야 한다(순서는 달라도 됨). 셔플 큐 소진 후 재생성된 큐도 동일한 불변성을 만족해야 한다.

**검증 대상: 요구사항 4.2, 4.3, 4.4**

---

### 속성 11: 셔플 OFF 복귀

*임의의* 셔플 상태에서 셔플을 OFF로 전환하면, 큐가 날짜순(내림차순)으로 복귀해야 한다.

**검증 대상: 요구사항 4.5**

---

### 속성 12: 커버 이미지 폴백 체인

*임의의* 트랙에 대해, 커버 이미지 해석 함수는 다음 우선순위를 따라야 한다: (1) DB의 cover_url → (2) iTunes API 검색 결과 → (3) Supabase Storage 수동 업로드 URL → (4) 기본 fallback 이미지. 어떤 경우에도 null이나 undefined를 반환해서는 안 된다.

**검증 대상: 요구사항 5.2, 5.3, 5.4, 5.5**

---

### 속성 13: DB 데이터 로드 반영

*임의의* 트랙 데이터를 Supabase DB에서 로드했을 때, TrackList에 표시되는 트랙 수와 내용이 DB 응답과 일치해야 한다.

**검증 대상: 요구사항 6.4**

---

## 에러 처리

### Supabase 연결 실패

- 트랙 목록 로드 실패 시: `error` 상태를 PlayerContext에 저장하고 TrackList에 오류 메시지 표시
- 오디오 파일 로드 실패 시: 해당 트랙을 건너뛰고 다음 트랙 재생 시도, 콘솔에 경고 로그

### iTunes API 실패 (곡 추가 시)

- API 응답 없음 또는 검색 결과 없음: Supabase Storage 수동 업로드 이미지 URL 사용
- 모든 소스 실패: 미리 정의된 기본 이미지(`/fallback-cover.png`) 표시

### 오디오 재생 에러

- `HTMLAudioElement`의 `error` 이벤트 처리
- 재생 불가 시 isPlaying을 false로 설정하고 사용자에게 토스트 알림

### 에러 상태 UI

```typescript
// PlayerContext 에러 상태
if (state.error) {
  return <ErrorMessage message={state.error} />;
}

// 로딩 상태
if (state.isLoading) {
  return <LoadingSpinner />;
}
```

---

## 테스트 전략

### 이중 테스트 접근법

단위 테스트와 속성 기반 테스트를 함께 사용합니다. 단위 테스트는 구체적인 예시와 엣지 케이스를, 속성 기반 테스트는 모든 입력에 대한 보편적 속성을 검증합니다.

### 단위 테스트 (Vitest + React Testing Library)

구체적인 예시와 엣지 케이스에 집중합니다:

- 초기 상태 검증 (autoplay=true, shuffle=false, sortOrder='desc')
- Supabase 로드 실패 시 오류 메시지 표시 (요구사항 6.5)
- Player 컨트롤 버튼 존재 확인 (요구사항 2.4, 2.5)
- 빈 트랙 목록 처리

### 속성 기반 테스트 (fast-check)

각 속성 테스트는 최소 100회 반복 실행합니다.
각 테스트에는 설계 문서의 속성을 참조하는 태그 주석을 포함합니다.

태그 형식: `// Feature: dajeonghan-band, Property {번호}: {속성 설명}`

```typescript
// 예시: 속성 4 - 정렬 순서 라운드트립
// Feature: dajeonghan-band, Property 4: 정렬 토글 두 번 클릭 시 원래 순서 복귀
fc.assert(
  fc.property(fc.array(arbitraryTrack, { minLength: 1 }), (tracks) => {
    const state1 = reducer(initialState(tracks), { type: 'TOGGLE_SORT' });
    const state2 = reducer(state1, { type: 'TOGGLE_SORT' });
    return state2.sortOrder === 'desc'; // 기본값으로 복귀
  }),
  { numRuns: 100 }
);
```

#### 속성별 테스트 구현 계획

| 속성 | 테스트 방식 | 생성기 |
|------|------------|--------|
| P1: 트랙 데이터 표시 완전성 | 속성 기반 | arbitraryTrack |
| P2: 초기 상태 불변성 | 속성 기반 | arbitraryTrackList |
| P3: 펼치기/접기 토글 | 속성 기반 | arbitraryTrack |
| P4: 정렬 순서 라운드트립 | 속성 기반 | arbitraryTrackList |
| P5: 활성 트랙 유일성 | 속성 기반 | arbitraryTrackList + index |
| P6: 시크바 seek 정확성 | 속성 기반 | fc.float (0~duration) |
| P7: 이전/다음 큐 탐색 | 속성 기반 | arbitraryQueue + index |
| P8: 자동재생 곡 종료 동작 | 속성 기반 | arbitraryQueue + boolean |
| P9: 자동재생 토글 라운드트립 | 속성 기반 | fc.boolean() |
| P10: 셔플 큐 불변성 | 속성 기반 | arbitraryTrackList |
| P11: 셔플 OFF 복귀 | 속성 기반 | arbitraryTrackList |
| P12: 커버 이미지 폴백 체인 | 속성 기반 | arbitraryCoverSources |
| P13: DB 데이터 로드 반영 | 속성 기반 | arbitraryTrackList (모킹) |

### 테스트 파일 구조

```
src/
├── __tests__/
│   ├── playerReducer.test.ts      # 단위 테스트
│   ├── playerReducer.prop.test.ts # 속성 기반 테스트
│   ├── TrackItem.test.tsx         # 컴포넌트 단위 테스트
│   └── coverImage.test.ts         # 커버 이미지 폴백 테스트
```
