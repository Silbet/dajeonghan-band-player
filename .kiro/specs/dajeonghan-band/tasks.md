# 구현 계획: 다정한 밴드

## 개요

React (Vite) + Tailwind CSS + Supabase 기반의 밴드 합주 녹음 공유/재생 웹 서비스를 구현합니다.
상단 고정 플레이어 + 하단 곡 목록 레이아웃으로, 다크톤 UI를 제공합니다.
테스트는 Vitest + React Testing Library + fast-check를 사용합니다.

## Tasks

- [x] 1. 프로젝트 초기 설정 및 타입 정의
  - [x] 1.1 Vite + React + TypeScript 프로젝트 생성 및 Tailwind CSS 설정
    - Vite로 React + TypeScript 프로젝트 생성
    - Tailwind CSS 설치 및 다크톤 기본 테마 설정
    - Vitest + React Testing Library + fast-check 설치 및 설정
    - Supabase 클라이언트 라이브러리 설치
    - _요구사항: 7.3, 7.4_

  - [x] 1.2 데이터 타입 및 인터페이스 정의
    - `src/types.ts`에 Track, Member 인터페이스 정의
    - PlayerState, PlayerAction 타입 정의
    - Supabase DB 응답을 프론트엔드 타입으로 변환하는 매핑 함수 작성
    - _요구사항: 6.1, 6.2, 6.3_

  - [x] 1.3 Supabase 클라이언트 설정
    - `src/lib/supabase.ts`에 Supabase 클라이언트 초기화
    - 트랙 목록 조회 함수 (`fetchTracks`) 작성
    - _요구사항: 6.4, 8.1_

- [x] 2. PlayerContext 및 리듀서 구현
  - [x] 2.1 playerReducer 구현
    - `src/context/playerReducer.ts`에 PlayerState 초기값 및 리듀서 함수 구현
    - LOAD_TRACKS, SELECT_TRACK, PLAY, PAUSE, NEXT, PREV, SEEK 액션 처리
    - TOGGLE_AUTOPLAY, TOGGLE_SHUFFLE, TOGGLE_SORT 액션 처리
    - SET_TIME, SET_DURATION, SET_ERROR 액션 처리
    - Fisher-Yates 셔플 알고리즘 구현 (`shuffleArray` 유틸)
    - _요구사항: 1.4, 1.5, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.2 속성 테스트: 정렬 순서 라운드트립 (Property 4)
    - **Property 4: 정렬 토글 두 번 클릭 시 원래 순서 복귀**
    - **검증 대상: 요구사항 1.4, 1.5**

  - [ ]* 2.3 속성 테스트: 이전/다음 큐 탐색 (Property 7)
    - **Property 7: 다음 버튼 시 인덱스 +1, 이전 버튼 시 인덱스 -1, 경계에서 순환**
    - **검증 대상: 요구사항 2.7, 2.8**

  - [ ]* 2.4 속성 테스트: 자동재생 상태에 따른 곡 종료 동작 (Property 8)
    - **Property 8: autoplay ON이면 다음 곡 재생, OFF이면 정지**
    - **검증 대상: 요구사항 3.2, 3.3**

  - [ ]* 2.5 속성 테스트: 자동재생 토글 라운드트립 (Property 9)
    - **Property 9: 자동재생 토글 두 번 클릭 시 원래 상태 복귀**
    - **검증 대상: 요구사항 3.4**

  - [ ]* 2.6 속성 테스트: 셔플 큐 불변성 (Property 10)
    - **Property 10: 셔플 큐는 원본과 동일한 요소 포함 (순서만 다름)**
    - **검증 대상: 요구사항 4.2, 4.3, 4.4**

  - [ ]* 2.7 속성 테스트: 셔플 OFF 복귀 (Property 11)
    - **Property 11: 셔플 OFF 시 날짜순(내림차순) 큐로 복귀**
    - **검증 대상: 요구사항 4.5**

  - [ ]* 2.8 속성 테스트: 시크바 seek 정확성 (Property 6)
    - **Property 6: 유효한 시간 값으로 seek 시 currentTime 변경**
    - **검증 대상: 요구사항 2.6**

  - [x] 2.9 PlayerContext Provider 구현
    - `src/context/PlayerContext.tsx`에 Context 및 Provider 컴포넌트 구현
    - HTML5 Audio 엘리먼트 관리 (useRef)
    - 오디오 이벤트 핸들링 (timeupdate, ended, error, loadedmetadata)
    - 자동재생 로직: 곡 종료 시 autoplay 상태에 따라 다음 곡 재생 또는 정지
    - 셔플 큐 소진 시 재생성 로직
    - _요구사항: 2.1, 3.1, 3.2, 3.3, 4.3, 4.4_

  - [ ]* 2.10 속성 테스트: 초기 상태 불변성 (Property 2)
    - **Property 2: 초기화 시 autoplay=true, shuffle=false, expanded=false**
    - **검증 대상: 요구사항 1.2, 3.1, 4.1**

- [x] 3. 커버 이미지 유틸리티 구현
  - [x] 3.1 커버 이미지 해석 함수 구현
    - `src/utils/coverImage.ts`에 커버 이미지 폴백 체인 함수 작성
    - 우선순위: DB cover_url → iTunes API → Supabase Storage → 기본 fallback 이미지
    - _요구사항: 5.2, 5.3, 5.4, 5.5_

  - [ ]* 3.2 속성 테스트: 커버 이미지 폴백 체인 (Property 12)
    - **Property 12: 어떤 경우에도 null/undefined 반환 없이 폴백 체인 동작**
    - **검증 대상: 요구사항 5.2, 5.3, 5.4, 5.5**

- [x] 4. 체크포인트 - 핵심 로직 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의합니다.

- [x] 5. FixedPlayer 컴포넌트 구현
  - [x] 5.1 FixedPlayer 레이아웃 및 TrackInfo 구현
    - `src/components/FixedPlayer.tsx` 생성
    - 상단 고정(sticky) 레이아웃, 다크톤 배경
    - 현재 재생 중인 곡의 제목, 아티스트, 앨범명, 커버이미지, 참여멤버, 녹음 날짜 표시
    - 모바일 반응형 (320px 이상)
    - _요구사항: 2.1, 2.2, 2.3, 7.1, 7.3_

  - [x] 5.2 Controls (재생/일시정지, 이전, 다음) 구현
    - 재생/일시정지, 이전 곡, 다음 곡 버튼 구현
    - PlayerContext dispatch 연결
    - _요구사항: 2.4, 2.7, 2.8_

  - [x] 5.3 SeekBar 구현
    - `src/components/SeekBar.tsx` 생성
    - 현재 재생 위치 / 전체 시간 표시
    - 드래그로 재생 위치 이동
    - _요구사항: 2.5, 2.6_

  - [x] 5.4 ToggleButtons (자동재생, 셔플) 구현
    - 자동재생 ON/OFF 토글 버튼 (시각적 상태 표시)
    - 셔플 ON/OFF 토글 버튼 (시각적 상태 표시)
    - _요구사항: 3.4, 3.5, 4.6_

  - [ ]* 5.5 속성 테스트: 트랙 데이터 표시 완전성 (Property 1)
    - **Property 1: TrackInfo 및 FixedPlayer가 모든 필수 정보를 렌더링**
    - **검증 대상: 요구사항 1.1, 2.2, 2.3, 6.1, 6.2**

- [x] 6. TrackList 컴포넌트 구현
  - [x] 6.1 TrackItem 컴포넌트 구현
    - `src/components/TrackItem.tsx` 생성
    - 제목, 아티스트, 앨범명, 재생시간, 커버이미지 기본 표시
    - 참여멤버, 녹음 날짜는 펼치기/접기 (기본 접힌 상태)
    - 현재 재생 중인 곡 하이라이트 처리
    - 클릭 시 해당 곡 재생
    - 다크톤 디자인, 모바일 반응형
    - _요구사항: 1.1, 1.2, 1.3, 1.6, 1.7, 7.2, 7.4_

  - [ ]* 6.2 속성 테스트: 펼치기/접기 토글 (Property 3)
    - **Property 3: 클릭 시 expanded 반전, 두 번 클릭 시 원래 상태 복귀**
    - **검증 대상: 요구사항 1.3**

  - [ ]* 6.3 속성 테스트: 활성 트랙 하이라이트 유일성 (Property 5)
    - **Property 5: 선택된 트랙만 isActive=true, 나머지는 false**
    - **검증 대상: 요구사항 1.6, 1.7**

  - [x] 6.4 TrackList 및 SortToggle 구현
    - `src/components/TrackList.tsx` 생성
    - 최신순/오래된순 정렬 토글 버튼
    - 트랙 목록 렌더링 (TrackItem 사용)
    - 로딩 상태 및 에러 메시지 표시
    - _요구사항: 1.4, 1.5, 6.4, 6.5_

  - [ ]* 6.5 속성 테스트: DB 데이터 로드 반영 (Property 13)
    - **Property 13: DB 응답과 TrackList 표시 트랙 수/내용 일치**
    - **검증 대상: 요구사항 6.4**

- [x] 7. 체크포인트 - UI 컴포넌트 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의합니다.

- [x] 8. App 통합 및 에러 처리
  - [x] 8.1 App 컴포넌트 통합
    - `src/App.tsx`에 PlayerContext.Provider로 FixedPlayer + TrackList 통합
    - 앱 초기화 시 Supabase에서 트랙 목록 로드
    - 전체 다크톤 레이아웃 적용
    - _요구사항: 2.1, 6.4, 7.3, 7.4, 8.1, 8.2_

  - [x] 8.2 에러 처리 및 로딩 상태 구현
    - Supabase 연결 실패 시 오류 메시지 표시
    - 오디오 파일 로드 실패 시 다음 트랙 건너뛰기
    - 로딩 스피너 표시
    - _요구사항: 6.5_

  - [ ]* 8.3 단위 테스트: 에러 상태 및 로딩 상태
    - Supabase 로드 실패 시 오류 메시지 표시 확인
    - 빈 트랙 목록 처리 확인
    - _요구사항: 6.5_

- [x] 9. 최종 체크포인트 - 전체 통합 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의합니다.

## 참고

- `*` 표시된 태스크는 선택 사항이며, 빠른 MVP를 위해 건너뛸 수 있습니다.
- 각 태스크는 추적 가능성을 위해 특정 요구사항을 참조합니다.
- 체크포인트는 점진적 검증을 보장합니다.
- 속성 테스트는 보편적 정확성 속성을 검증하고, 단위 테스트는 구체적 예시와 엣지 케이스를 검증합니다.
