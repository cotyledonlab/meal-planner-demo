import { render, screen } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import type { ImageProps } from 'next/image';
import HeroImage from './HeroImage';

// Track onError callbacks for testing
let capturedOnError: (() => void) | undefined;

// Mock next/image to capture and expose onError
vi.mock('next/image', () => ({
  default: ({ alt, src, onError, ...props }: ImageProps & { onError?: () => void }) => {
    capturedOnError = onError;
    // Strip Next.js-specific props
    const { fill, priority, placeholder, blurDataURL, sizes, ...imgProps } = props;
    void fill;
    void priority;
    void placeholder;
    void blurDataURL;
    void sizes;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        src={typeof src === 'string' ? src : ''}
        data-testid="hero-image"
        {...imgProps}
      />
    );
  },
}));

describe('HeroImage Component', () => {
  beforeEach(() => {
    capturedOnError = undefined;
  });

  it('renders with primary image source initially', () => {
    render(<HeroImage />);

    const image = screen.getByTestId('hero-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/hero-cooking.jpg');
    expect(image).toHaveAttribute('alt', 'Fresh ingredients for home cooking in an Irish kitchen');
  });

  it('falls back to Unsplash image on error', () => {
    const { rerender } = render(<HeroImage />);

    // Simulate image load error
    expect(capturedOnError).toBeDefined();
    capturedOnError?.();

    // Re-render to pick up state change
    rerender(<HeroImage />);

    const image = screen.getByTestId('hero-image');
    expect(image).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=2070&q=80'
    );
  });

  it('does not trigger infinite loop when fallback also fails', () => {
    const { rerender } = render(<HeroImage />);

    // First error - should switch to fallback
    capturedOnError?.();
    rerender(<HeroImage />);

    const image = screen.getByTestId('hero-image');
    const fallbackUrl =
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=2070&q=80';
    expect(image).toHaveAttribute('src', fallbackUrl);

    // Second error - should NOT change src (guard against infinite loop)
    capturedOnError?.();
    rerender(<HeroImage />);

    // Image should still have fallback URL (not changed)
    expect(image).toHaveAttribute('src', fallbackUrl);
  });
});
