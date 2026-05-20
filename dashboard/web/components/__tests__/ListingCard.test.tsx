import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListingCard } from '../ListingCard';

describe('ListingCard (motion-wrapped)', () => {
  const baseProps = {
    company: 'Fever',
    role: 'Senior Design Systems Engineer',
    score: 4.58,
    status: 'Applied' as const,
    source: 'LinkedIn',
  };

  it('renders company name, role, score, and source', () => {
    render(<ListingCard {...baseProps} />);
    expect(screen.getByTestId('listing-company')).toHaveTextContent('Fever');
    expect(screen.getByTestId('listing-role')).toHaveTextContent('Senior Design Systems Engineer');
    expect(screen.getByTestId('listing-card')).toHaveTextContent('4.58');
    expect(screen.getByTestId('listing-source')).toHaveTextContent('LinkedIn');
  });

  it('renders a StatusBadge child for the given status', () => {
    render(<ListingCard {...baseProps} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Applied');
  });

  it('fires onOpen when [Open] button is clicked', () => {
    const onOpen = vi.fn();
    render(<ListingCard {...baseProps} onOpen={onOpen} />);
    fireEvent.click(screen.getByTestId('listing-open'));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('is wrapped in a motion element (motion-listing-card testid present)', () => {
    render(<ListingCard {...baseProps} />);
    expect(screen.getByTestId('motion-listing-card')).toBeInTheDocument();
  });
});
