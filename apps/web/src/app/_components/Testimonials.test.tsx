import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ImageProps } from 'next/image';
import Testimonials from './Testimonials';

// Mock next/image to strip Next.js-specific props
vi.mock('next/image', () => ({
  default: ({ alt, src, className, ...props }: ImageProps) => {
    const { width, height, ...imgProps } = props;
    void width;
    void height;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        src={typeof src === 'string' ? src : ''}
        className={className}
        data-testid="testimonial-avatar"
        {...imgProps}
      />
    );
  },
}));

// Mock heroicons
vi.mock('@heroicons/react/24/solid', () => ({
  StarIcon: ({ className }: { className?: string }) => (
    <svg data-testid="star-icon" className={className} />
  ),
}));

describe('Testimonials Component', () => {
  it('renders the section heading', () => {
    render(<Testimonials />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Real Irish families, real results');
  });

  it('renders the subheading text', () => {
    render(<Testimonials />);

    const subtext = screen.getByText(/reclaimed their evenings/i);
    expect(subtext).toBeInTheDocument();
  });

  it('renders all three testimonials', () => {
    render(<Testimonials />);

    // Check for all three authors
    expect(screen.getByText('Aoife M.')).toBeInTheDocument();
    expect(screen.getByText('Conor D.')).toBeInTheDocument();
    expect(screen.getByText('Niamh O.')).toBeInTheDocument();
  });

  it('renders testimonial quotes with line-clamp styling', () => {
    render(<Testimonials />);

    // Find quote elements by their content
    const aoifeQuote = screen.getByText(/Sunday evenings used to be chaos/i);
    expect(aoifeQuote).toBeInTheDocument();
    expect(aoifeQuote).toHaveClass('line-clamp-4');
  });

  it('renders star ratings for each testimonial', () => {
    render(<Testimonials />);

    // Each testimonial has 5 stars, so 15 total
    const stars = screen.getAllByTestId('star-icon');
    expect(stars).toHaveLength(15);
  });

  it('renders testimonial locations', () => {
    render(<Testimonials />);

    expect(screen.getByText('Cork')).toBeInTheDocument();
    expect(screen.getByText('Dublin')).toBeInTheDocument();
    expect(screen.getByText('Galway')).toBeInTheDocument();
  });

  it('renders verified household badges', () => {
    render(<Testimonials />);

    const badges = screen.getAllByText('Verified household');
    expect(badges).toHaveLength(3);
  });

  it('renders avatar images for each testimonial', () => {
    render(<Testimonials />);

    const avatars = screen.getAllByTestId('testimonial-avatar');
    expect(avatars).toHaveLength(3);

    // Check alt text for accessibility
    expect(screen.getByAltText('Aoife M. avatar')).toBeInTheDocument();
    expect(screen.getByAltText('Conor D. avatar')).toBeInTheDocument();
    expect(screen.getByAltText('Niamh O. avatar')).toBeInTheDocument();
  });

  it('renders timeframe and proof details', () => {
    render(<Testimonials />);

    expect(screen.getByText('Using MealMind for 4 months')).toBeInTheDocument();
    expect(screen.getByText(/Reduced weekly shop by €20/i)).toBeInTheDocument();
  });

  it('uses flex layout for proper card structure', () => {
    render(<Testimonials />);

    // Find figure elements with proper aria-label
    const testimonialCard = screen.getByLabelText(/Testimonial from Aoife M/i);
    expect(testimonialCard).toHaveClass('flex', 'flex-col', 'h-full');
  });
});
