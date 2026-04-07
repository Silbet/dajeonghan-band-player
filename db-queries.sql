-- =============================================
-- 다정한 밴드 DB 쿼리 모음
-- =============================================


-- =============================================
-- 테이블 생성 (최초 1회)
-- =============================================
CREATE TABLE tracks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  artist        TEXT NOT NULL,
  album         TEXT NOT NULL,
  duration      INTEGER NOT NULL DEFAULT 0,
  recorded_at   DATE NOT NULL,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  audio_url     TEXT NOT NULL,
  cover_url     TEXT,
  members       JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON tracks FOR SELECT USING (true);


-- =============================================
-- 곡 추가 템플릿
-- =============================================
INSERT INTO tracks (title, artist, album, duration, recorded_at, audio_url, cover_url, members)
VALUES (
  '곡 제목',
  '원곡 아티스트',
  '앨범명',
  0,
  'YYYY-MM-DD',
  'https://xkpneoeazzcjvhlwspbp.supabase.co/storage/v1/object/public/audio/파일명.mp3',
  NULL,
  '[{"name": "이름", "part": "파트"}]'
);


-- =============================================
-- 실제 추가된 곡들
-- =============================================

-- 청춘만화 (2025-01-31)
INSERT INTO tracks (title, artist, album, duration, recorded_at, audio_url, cover_url, members)
VALUES (
  '청춘만화',
  '이무진',
  '만화 (滿花)',
  0,
  '2025-01-31',
  'https://xkpneoeazzcjvhlwspbp.supabase.co/storage/v1/object/public/audio/youth-comic.mp3',
  NULL,
  '[{"name": "김민주", "part": "보컬1"}, {"name": "이석형", "part": "보컬2"}, {"name": "송태관", "part": "기타1"}, {"name": "황겸", "part": "기타2"}, {"name": "김준범", "part": "건반"}, {"name": "박다은", "part": "베이스"}, {"name": "김민수", "part": "드럼"}]'
);


-- =============================================
-- 곡 수정 템플릿
-- =============================================

-- audio_url 변경
-- UPDATE tracks SET audio_url = '새URL' WHERE title = '곡 제목';

-- cover_url 변경
-- UPDATE tracks SET cover_url = '이미지URL' WHERE title = '곡 제목';

-- 전체 확인
-- SELECT id, title, artist, recorded_at, audio_url, cover_url FROM tracks ORDER BY recorded_at DESC;
