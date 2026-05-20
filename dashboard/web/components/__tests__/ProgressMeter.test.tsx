import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressMeter } from '../ProgressMeter';

describe('ProgressMeter (motion-wrapped)', () => {
  const stats = [
    { label: 'Evaluated', value: 52, color: 'ink' as const },
    { label: 'Applied',   value: 25, color: 'cyber' as const },
    { label: 'Interview', value: 3,  color: 'magenta' as const },
    { label: 'Offer',     value: 1,  color: 'acid' as const },
  ];

  it('renders 4 stat cells with labels + values', () => {
    render(<ProgressMeter stats={stats} total={81} />);
    expect(screen.getByTestId('stat-Evaluated')).toHaveTextContent('52');
    expect(screen.getByTestId('stat-Applied')).toHaveTextContent('25');
    expect(screen.getByTestId('stat-Interview')).toHaveTextContent('3');
    expect(screen.getByTestId('stat-Offer')).toHaveTextContent('1');
  });

  it('renders a progressbar with aria-valuemax = total', () => {
    render(<ProgressMeter stats={stats} total={81} />);
    const bar = screen.getByTestId('progress-meter-bar');
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuemax')).toBe('81');
    expect(bar.getAttribute('aria-valuenow')).toBe('81');
  });

  it('renders 4 horizontal segments with width proportional to stat.value/total', () => {
    render(<ProgressMeter stats={stats} total={81} />);
    const seg1 = screen.getByTestId('progress-segment-Evaluated') as HTMLElement;
    const seg2 = screen.getByTestId('progress-segment-Applied') as HTMLElement;
    expect(seg1.style.width).toBe(`${(52/81)*100}%`);
    expect(seg2.style.width).toBe(`${(25/81)*100}%`);
  });

  it('is wrapped in a motion element (motion-progress-meter testid present)', () => {
    render(<ProgressMeter stats={stats} total={81} />);
    expect(screen.getByTestId('motion-progress-meter')).toBeInTheDocument();
  });
});
