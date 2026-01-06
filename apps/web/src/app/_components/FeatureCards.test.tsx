import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FeatureCards from '~/components/features/landing/FeatureCards';

describe('FeatureCards', () => {
  it('renders all feature cards with new emotional messaging', () => {
    render(<FeatureCards />);

    expect(screen.getByText(/No More "What's for Dinner\?" Panic/)).toBeInTheDocument();
    expect(screen.getByText('Shopping Made Stupidly Simple')).toBeInTheDocument();
    expect(screen.getByText('Save Money Without the Hassle')).toBeInTheDocument();
    expect(screen.getByText('Actually Works for Your Family')).toBeInTheDocument();
  });

  it('renders premium badges with correct styling', () => {
    render(<FeatureCards />);

    // Find premium badges by text content (updated design uses gradient background)
    const premiumBadges = screen.getAllByText('Premium');

    // Should have 2 premium features
    expect(premiumBadges).toHaveLength(2);

    // Check that premium badges have the correct text color
    premiumBadges.forEach((badge) => {
      expect(badge.classList.contains('text-amber-700')).toBe(true);
    });
  });

  it('renders sparkles icons in premium badges', () => {
    const { container } = render(<FeatureCards />);

    // Find all SVG sparkles icons in premium badges (updated from lock to sparkles)
    const sparklesIcons = container.querySelectorAll('.lucide-sparkles');

    // Should have 2 sparkles icons (one per premium feature)
    expect(sparklesIcons).toHaveLength(2);

    // Verify SVG attributes
    sparklesIcons.forEach((icon) => {
      expect(icon.getAttribute('viewBox')).toBe('0 0 24 24');
      expect(icon.getAttribute('stroke')).toBe('currentColor');
    });
  });

  it('positions premium badges in top-right corner', () => {
    const { container } = render(<FeatureCards />);

    const premiumBadges = container.querySelectorAll('span.bg-amber-100.px-2\\.5');

    premiumBadges.forEach((badge) => {
      expect(badge.classList.contains('absolute')).toBe(true);
      expect(badge.classList.contains('right-4')).toBe(true);
      expect(badge.classList.contains('top-4')).toBe(true);
    });
  });

  it('does not render premium badge for free features', () => {
    const { container } = render(<FeatureCards />);

    // Get all feature cards
    const cards = container.querySelectorAll('.rounded-2xl.bg-white');

    // First two cards should not have premium badges
    const firstCard = cards[0];
    const secondCard = cards[1];

    expect(firstCard?.querySelector('span.bg-amber-100.px-2\\.5')).toBeNull();
    expect(secondCard?.querySelector('span.bg-amber-100.px-2\\.5')).toBeNull();
  });

  it('renders premium badge with inline-flex layout', () => {
    render(<FeatureCards />);

    // Get premium badge spans by text
    const premiumBadges = screen.getAllByText('Premium');

    // Should have 2 premium badges
    expect(premiumBadges).toHaveLength(2);

    // Each badge should have inline-flex layout classes
    premiumBadges.forEach((badge) => {
      expect(badge.classList.contains('inline-flex')).toBe(true);
      expect(badge.classList.contains('items-center')).toBe(true);
    });
  });
});
