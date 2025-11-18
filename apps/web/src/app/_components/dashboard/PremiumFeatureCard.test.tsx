import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PremiumFeatureCard from './PremiumFeatureCard';

describe('PremiumFeatureCard', () => {
  const defaultProps = {
    title: 'Test Feature',
    description: 'This is a test feature description',
    icon: '🎯',
    isPremiumUser: false,
  };

  it('renders the feature title, description, and icon', () => {
    render(<PremiumFeatureCard {...defaultProps} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('shows "Go Premium" button for non-premium users', () => {
    render(<PremiumFeatureCard {...defaultProps} />);

    const goPremiumButton = screen.getByRole('link', { name: /go premium/i });
    expect(goPremiumButton).toBeInTheDocument();
    expect(goPremiumButton).toHaveAttribute('href', '/#pricing');
  });

  it('shows lock icon for non-premium users', () => {
    const { container } = render(<PremiumFeatureCard {...defaultProps} />);

    // Lock icon should be present in a gray background container
    const lockContainer = container.querySelector('.bg-gray-100.text-gray-600');
    expect(lockContainer).toBeInTheDocument();
  });

  it('shows "Coming soon" badge for premium users', () => {
    render(<PremiumFeatureCard {...defaultProps} isPremiumUser={true} />);

    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('does not show lock icon for premium users', () => {
    const { container } = render(<PremiumFeatureCard {...defaultProps} isPremiumUser={true} />);

    // Lock icon should not be present for premium users
    expect(container.querySelector('.bg-gray-100')).not.toBeInTheDocument();
  });

  describe('Preview button', () => {
    it('shows "See Example" button when onPreview is provided', () => {
      const onPreview = vi.fn();
      render(<PremiumFeatureCard {...defaultProps} onPreview={onPreview} />);

      const previewButton = screen.getByRole('button', { name: /see example/i });
      expect(previewButton).toBeInTheDocument();
    });

    it('calls onPreview when "See Example" button is clicked', async () => {
      const user = userEvent.setup();
      const onPreview = vi.fn();
      render(<PremiumFeatureCard {...defaultProps} onPreview={onPreview} />);

      const previewButton = screen.getByRole('button', { name: /see example/i });
      await user.click(previewButton);

      expect(onPreview).toHaveBeenCalledTimes(1);
    });

    it('shows preview label when previewLabel is provided', () => {
      const onPreview = vi.fn();
      render(
        <PremiumFeatureCard
          {...defaultProps}
          onPreview={onPreview}
          previewLabel="View sample price comparison"
        />
      );

      expect(screen.getByText('View sample price comparison')).toBeInTheDocument();
    });

    it('does not show preview button when onPreview is not provided', () => {
      render(<PremiumFeatureCard {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /see example/i })).not.toBeInTheDocument();
    });

    it('has proper aria-label for accessibility', () => {
      const onPreview = vi.fn();
      render(<PremiumFeatureCard {...defaultProps} onPreview={onPreview} />);

      const previewButton = screen.getByRole('button', { name: /see example/i });
      expect(previewButton).toHaveAttribute(
        'aria-label',
        'See example of this feature with sample data'
      );
    });
  });

  describe('Learn More button', () => {
    it('shows "Learn more" button for premium users when onLearnMore is provided', () => {
      const onLearnMore = vi.fn();
      render(
        <PremiumFeatureCard {...defaultProps} isPremiumUser={true} onLearnMore={onLearnMore} />
      );

      expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument();
    });

    it('calls onLearnMore when "Learn more" button is clicked', async () => {
      const user = userEvent.setup();
      const onLearnMore = vi.fn();
      render(
        <PremiumFeatureCard {...defaultProps} isPremiumUser={true} onLearnMore={onLearnMore} />
      );

      const learnMoreButton = screen.getByRole('button', { name: /learn more/i });
      await user.click(learnMoreButton);

      expect(onLearnMore).toHaveBeenCalledTimes(1);
    });
  });
});
