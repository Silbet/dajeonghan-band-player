# 요구사항 문서

## 소개

"다정한 밴드"는 밴드 합주 녹음을 웹에서 공유하고 재생할 수 있는 정적 웹 서비스입니다.
React + Supabase + Vercel 스택으로 구성되며, 로그인 없이 링크만으로 누구나 접근 가능합니다.
상단 고정 플레이어와 하단 곡 목록으로 구성된 스포티파이/유튜브뮤직 스타일의 다크톤 UI를 제공합니다.

## 용어 정의

- **Player**: 상단에 고정된 오디오 재생 컨트롤 컴포넌트
- **Track**: 밴드 합주 녹음 한 곡 (제목, 원곡 아티스트, 앨범명, 재생시간, 커버이미지, 참여멤버, 녹음 날짜 포함)
- **Track_List**: 하단에 표시되는 전체 곡 목록 컴포넌트
- **Queue**: 재생 순서가 결정된 곡 목록 (일반 순서 또는 셔플된 순서)
- **Shuffle_Queue**: 전체 곡을 미리 섞어 만든 재생 큐
- **Cover_Image**: 원곡의 앨범 커버 이미지
- **iTunes_API**: 원곡 앨범 커버 URL을 검색하는 Apple iTunes Search API
- **Supabase_Storage**: MP3 파일 및 수동 업로드 커버 이미지를 저장하는 클라우드 스토리지
- **Supabase_DB**: 곡 메타데이터 및 커버 이미지 URL을 저장하는 데이터베이스
- **Member**: 곡에 참여한 밴드 멤버 (파트 정보 포함)

---

## 요구사항

### 요구사항 1: 곡 목록 표시

**User Story:** 방문자로서, 밴드가 녹음한 곡 목록을 보고 싶다. 그래야 어떤 곡이 있는지 파악하고 듣고 싶은 곡을 선택할 수 있다.

#### 인수 기준

1. THE Track_List SHALL 제목, 원곡 아티스트, 앨범명, 재생시간, 커버이미지를 각 곡마다 기본으로 표시한다.
2. THE Track_List SHALL 참여멤버(파트별)와 녹음 날짜를 기본적으로 숨긴 상태로 표시한다.
3. WHEN 사용자가 곡 항목을 탭(클릭)하면, THE Track_List SHALL 해당 곡의 참여멤버 정보와 녹음 날짜를 펼치거나 접는다.
4. THE Track_List SHALL 기본적으로 최신 날짜순(내림차순)으로 곡을 정렬하여 표시한다.
5. WHEN 사용자가 정렬 토글을 클릭하면, THE Track_List SHALL 최신순과 오래된순 사이에서 정렬 순서를 전환한다.
6. WHEN 곡이 재생 중이면, THE Track_List SHALL 해당 곡 항목을 시각적으로 하이라이트 처리한다.
7. WHEN 사용자가 곡 항목을 탭(클릭)하면, THE Player SHALL 해당 곡을 즉시 재생한다.

---

### 요구사항 2: 오디오 플레이어

**User Story:** 방문자로서, 페이지를 스크롤해도 항상 보이는 플레이어로 음악을 제어하고 싶다. 그래야 곡 목록을 탐색하면서도 재생을 끊김 없이 제어할 수 있다.

#### 인수 기준

1. THE Player SHALL 페이지 상단에 고정(sticky/fixed)되어 스크롤과 무관하게 항상 표시된다.
2. THE Player SHALL 현재 재생 중인 곡의 제목, 원곡 아티스트, 앨범명, 커버이미지를 표시한다.
3. THE Player SHALL 현재 재생 중인 곡의 참여멤버(파트별)와 녹음 날짜를 표시한다.
4. THE Player SHALL 재생/일시정지, 이전 곡, 다음 곡 버튼을 제공한다.
5. THE Player SHALL 현재 재생 위치와 전체 재생시간을 표시하는 시크바(seek bar)를 제공한다.
6. WHEN 사용자가 시크바를 드래그하면, THE Player SHALL 해당 위치로 재생 위치를 이동한다.
7. WHEN 사용자가 이전 곡 버튼을 클릭하면, THE Player SHALL Queue에서 이전 곡을 재생한다.
8. WHEN 사용자가 다음 곡 버튼을 클릭하면, THE Player SHALL Queue에서 다음 곡을 재생한다.

---

### 요구사항 3: 자동재생

**User Story:** 방문자로서, 한 곡이 끝나면 자동으로 다음 곡이 재생되길 원한다. 그래야 별도 조작 없이 음악을 계속 들을 수 있다.

#### 인수 기준

1. THE Player SHALL 자동재생 기능을 기본값 ON 상태로 시작한다.
2. WHEN 자동재생이 ON이고 현재 곡이 끝나면, THE Player SHALL Queue의 다음 곡을 자동으로 재생한다.
3. WHEN 자동재생이 OFF이고 현재 곡이 끝나면, THE Player SHALL 재생을 멈추고 다음 곡으로 이동하지 않는다.
4. WHEN 사용자가 자동재생 토글을 클릭하면, THE Player SHALL 자동재생 상태를 ON/OFF로 전환한다.
5. THE Player SHALL 현재 자동재생 상태(ON/OFF)를 시각적으로 표시한다.

---

### 요구사항 4: 셔플 재생

**User Story:** 방문자로서, 곡을 무작위 순서로 듣고 싶다. 그래야 매번 다른 순서로 음악을 즐길 수 있다.

#### 인수 기준

1. THE Player SHALL 셔플 기능을 기본값 OFF 상태로 시작한다.
2. WHEN 셔플이 ON으로 전환되면, THE Player SHALL 전체 곡 목록을 미리 무작위로 섞어 Shuffle_Queue를 생성한다.
3. WHILE 셔플이 ON이면, THE Player SHALL Shuffle_Queue 순서대로 곡을 재생한다.
4. WHEN Shuffle_Queue의 마지막 곡 재생이 끝나면, THE Player SHALL 전체 곡 목록을 다시 무작위로 섞어 새로운 Shuffle_Queue를 생성하고 첫 번째 곡부터 재생한다.
5. WHEN 셔플이 OFF로 전환되면, THE Player SHALL 원래 날짜순 Queue로 복귀하여 현재 곡 이후부터 순서대로 재생한다.
6. THE Player SHALL 현재 셔플 상태(ON/OFF)를 시각적으로 표시한다.

---

### 요구사항 5: 커버 이미지 자동 검색

**User Story:** 방문자로서, 각 곡의 원곡 앨범 커버를 보고 싶다. 그래야 시각적으로 풍부한 경험을 할 수 있다.

#### 인수 기준

1. WHEN 곡이 Supabase_DB에 추가될 때, THE Cover_Image SHALL iTunes_API를 통해 원곡 아티스트와 제목으로 앨범 커버 URL을 검색하여 Supabase_DB에 저장한다.
2. WHEN 사이트 방문자가 곡 목록을 로드하면, THE Track_List SHALL Supabase_DB에 저장된 커버 이미지 URL을 사용하여 이미지를 표시한다.
3. WHEN Supabase_DB에 커버 이미지 URL이 없으면, THE Cover_Image SHALL iTunes_API를 호출하여 URL을 검색한다.
4. IF iTunes_API로 커버 이미지를 찾지 못하면, THE Cover_Image SHALL Supabase_Storage에 수동으로 업로드된 이미지 URL을 사용한다.
5. IF 커버 이미지 URL을 어떤 방법으로도 확보하지 못하면, THE Cover_Image SHALL 미리 정의된 기본 이미지(fallback)를 표시한다.

---

### 요구사항 6: 곡 데이터 관리

**User Story:** 개발자로서, Supabase 대시보드에서 직접 곡을 추가하고 관리하고 싶다. 그래야 별도의 관리 UI 없이 간단하게 콘텐츠를 업데이트할 수 있다.

#### 인수 기준

1. THE Track SHALL 제목, 원곡 아티스트, 앨범명, 재생시간, 녹음 날짜, 업로드 날짜, 참여멤버(이름 및 파트) 정보를 포함한다.
2. THE Track SHALL Supabase_Storage에 저장된 MP3 파일의 URL을 참조한다.
3. THE Track SHALL iTunes_API로 검색하거나 수동으로 업로드한 커버 이미지 URL을 Supabase_DB에 저장한다.
4. THE Track_List SHALL Supabase_DB에서 곡 메타데이터를 조회하여 표시한다.
5. IF Supabase 데이터 로드에 실패하면, THE Track_List SHALL 사용자에게 오류 메시지를 표시한다.
6. THE 서비스 SHALL 곡 추가 및 수정을 위한 별도의 관리자 페이지를 제공하지 않으며, Supabase 대시보드를 통해 직접 관리한다.

---

### 요구사항 7: 반응형 UI 및 디자인

**User Story:** 방문자로서, 모바일과 데스크톱 모두에서 편리하게 서비스를 이용하고 싶다. 그래야 어떤 기기에서도 음악을 즐길 수 있다.

#### 인수 기준

1. THE Player SHALL 모바일 화면(320px 이상)에서 모든 컨트롤이 조작 가능하도록 표시된다.
2. THE Track_List SHALL 모바일 화면(320px 이상)에서 각 곡 항목이 가독성 있게 표시된다.
3. THE Player SHALL 다크톤 배경색을 기반으로 한 스포티파이/유튜브뮤직 스타일의 디자인을 적용한다.
4. THE Track_List SHALL 다크톤 배경색을 기반으로 한 스포티파이/유튜브뮤직 스타일의 디자인을 적용한다.

---

### 요구사항 8: 접근성

**User Story:** 방문자로서, 링크만으로 별도 로그인 없이 서비스에 접근하고 싶다. 그래야 공유받은 누구나 바로 음악을 들을 수 있다.

#### 인수 기준

1. THE 서비스 SHALL 인증 없이 URL 접근만으로 모든 기능을 이용할 수 있다.
2. THE 서비스 SHALL 사용자 로그인, 회원가입, 인증 관련 UI를 제공하지 않는다.
