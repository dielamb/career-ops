import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge (motion-wrapped)', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="Applied" />);
    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Applied');
  });

  it('applies the Applied status colour classes (bg-cyber + text-ink)', () => {
    render(<StatusBadge status="Applied" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge.className).toMatch(/bg-cyber/);
    expect(badge.className).toMatch(/text-ink/);
  });

  it('marks Rejected with line-through + ink-dim', () => {
    render(<StatusBadge status="Rejected" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge.className).toMatch(/line-through/);
    expect(badge.className).toMatch(/text-ink-dim/);
  });

  it('is wrapped in a motion element (data-testid motion-status-badge present)', () => {
    render(<StatusBadge status="Evaluated" />);
    expect(screen.getByTestId('motion-status-badge')).toBeInTheDocument();
  });
});
