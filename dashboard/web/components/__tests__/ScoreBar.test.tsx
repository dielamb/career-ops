import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBar } from '../ScoreBar';

describe('ScoreBar (motion-wrapped)', () => {
  it('renders the progressbar role with default max=5', () => {
    render(<ScoreBar score={4.58} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar.getAttribute('aria-valuemax')).toBe('5');
    expect(bar.getAttribute('aria-valuenow')).toBe('4.58');
  });

  it('fill width is proportional to score/max (score=4 -> 80%)', () => {
    render(<ScoreBar score={4} max={5} />);
    const fill = screen.getByTestId('score-bar-fill') as HTMLElement;
    expect(fill.style.width).toBe('80%');
  });

  it('clamps over-max score to max (score=10 with max=5 -> 100%)', () => {
    render(<ScoreBar score={10} max={5} />);
    const fill = screen.getByTestId('score-bar-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('clamps negative score to 0 (score=-1 -> 0%)', () => {
    render(<ScoreBar score={-1} />);
    const fill = screen.getByTestId('score-bar-fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });
});
