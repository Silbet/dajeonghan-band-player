import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TrackItem from './TrackItem';
import type { Track } from '../types';

const mockTrack: Track = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: 185,
  recordedAt: '2024-01-15',
  uploadedAt: '2024-01-15T10:00:00Z',
  audioUrl: 'https://example.com/audio.mp3',
  coverUrl: 'https://example.com/cover.jpg',
  members: [
    { name: '홍길동', part: '기타' },
    { name: '김철수', part: '드럼' },
  ],
};

describe('TrackItem', () => {
  it('renders title, artist, album, and duration', () => {
    render(
      <TrackItem track={mockTrack} index={0} isActive={false} onSelect={vi.fn()} />
    );
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist · Test Album')).toBeInTheDocument();
    expect(screen.getByText('3:05')).toBeInTheDocument();
  });

  it('renders cover image', () => {
    render(
      <TrackItem track={mockTrack} index={0} isActive={false} onSelect={vi.fn()} />
    );
    const img = screen.getByAltText('Test Album 커버');
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('does not show members and recorded date by default', () => {
    render(
      <TrackItem track={mockTrack} index={0} isActive={false} onSelect={vi.fn()} />
    );
    expect(screen.queryByText(/홍길동/)).not.toBeInTheDocument();
    expect(screen.queryByText('2024-01-15')).not.toBeInTheDocument();
  });

  it('expands to show members and recorded date on click', () => {
    render(
      <TrackItem track={mockTrack} index={0} isActive={false} onSelect={vi.fn()} />
    );
    const expandBtn = screen.getByRole('button', { name: /상세정보 펼치기/ });
    fireEvent.click(expandBtn);
    expect(screen.getByText(/홍길동\(기타\)/)).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('collapses on second click', () => {
    render(
      <TrackItem track={mockTrack} index={0} isActive={false} onSelect={vi.fn()} />
    );
    const expandBtn = screen.getByRole('button', { name: /상세정보/ });
    fireEvent.click(expandBtn);
    expect(screen.getByText(/홍길동/)).toBeInTheDocument();
    fireEvent.click(expandBtn);
    expect(screen.queryByText(/홍길동/)).not.toBeInTheDocument();
  });

  it('calls onSelect when play button is clicked', () => {
    const onSelect = vi.fn();
    render(
      <TrackItem track={mockTrack} index={0} isActive={false} onSelect={onSelect} />
    );
    const playBtn = screen.getByRole('button', { name: /재생/ });
    fireEvent.click(playBtn);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('does not call onSelect when expand area is clicked', () => {
    const onSelect = vi.fn();
    render(
      <TrackItem track={mockTrack} index={0} isActive={false} onSelect={onSelect} />
    );
    const expandBtn = screen.getByRole('button', { name: /상세정보/ });
    fireEvent.click(expandBtn);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('applies highlight styling when isActive is true', () => {
    const { container } = render(
      <TrackItem track={mockTrack} index={0} isActive={true} onSelect={vi.fn()} />
    );
    const li = container.querySelector('li');
    expect(li?.className).toContain('bg-bg-tertiary');
  });

  it('formats duration as mm:ss', () => {
    const shortTrack = { ...mockTrack, duration: 62 };
    render(
      <TrackItem track={shortTrack} index={0} isActive={false} onSelect={vi.fn()} />
    );
    expect(screen.getByText('1:02')).toBeInTheDocument();
  });
});
