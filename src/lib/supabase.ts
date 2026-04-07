import { createClient } from '@supabase/supabase-js';
import { type Track, type SupabaseTrackRow, mapSupabaseTrack } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('recorded_at', { ascending: false })
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new Error(`트랙 목록 로드 실패: ${error.message}`);
  }

  return (data as SupabaseTrackRow[]).map(mapSupabaseTrack);
}

// iTunes Search API로 앨범 커버 URL 검색
async function fetchCoverFromItunes(artist: string, title: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
    const json = await res.json();
    const result = json.results?.[0];
    if (!result?.artworkUrl100) return null;
    // 100x100 → 600x600으로 업그레이드
    return result.artworkUrl100.replace('100x100bb', '600x600bb');
  } catch {
    return null;
  }
}

// cover_url이 null인 트랙들의 커버를 iTunes에서 찾아 DB에 저장
export async function resolveMissingCovers(tracks: Track[]): Promise<Track[]> {
  const missing = tracks.filter(t => !t.coverUrl);
  if (missing.length === 0) return tracks;

  const updated = await Promise.all(
    missing.map(async (track) => {
      const url = await fetchCoverFromItunes(track.artist, track.title);
      if (!url) return null;

      // DB에 저장
      await supabase
        .from('tracks')
        .update({ cover_url: url })
        .eq('id', track.id);

      return { id: track.id, coverUrl: url };
    })
  );

  // 업데이트된 URL을 트랙 목록에 반영
  const updateMap = new Map(
    updated.filter(Boolean).map(u => [u!.id, u!.coverUrl])
  );

  return tracks.map(t =>
    updateMap.has(t.id) ? { ...t, coverUrl: updateMap.get(t.id)! } : t
  );
}
